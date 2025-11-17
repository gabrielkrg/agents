<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Message;
use Illuminate\Support\Collection;

class GeminiService
{
    /**
     * Gera conteúdo usando a API do Gemini
     *
     * @param Prompt $prompt
     * @param Request $request
     * @param bool $useChats Se true, usa os chats do prompt; se false, usa apenas o conteúdo da requisição
     * @return array{parsed: array|string, raw: string}
     * @throws \Exception
     */
    public function generateContent(?Agent $agent, Chat $chat, Request $request): array
    {
        $parts = $this->prepareParts($chat->messages, $request);

        $requestData = $this->buildRequestData($agent ? $agent : null, $parts);

        $response = $this->sendRequest($requestData);
        $responseData = $this->extractResponseData($response);

        return [
            'parsed' => $this->parseResponse($agent, $responseData),
            'raw' => $responseData
        ];
    }

    /**
     * Prepara os chats a partir do prompt e adiciona arquivos se houver
     *
     * @param Collection<Message> $messages
     * @param Request $request
     * @return array
     */
    protected function prepareParts(Collection $messages, Request $request): array
    {
        $parts = [];

        foreach ($messages as $message) {
            $parts[] = [
                'role' => $message->role,
                'parts' => [
                    [
                        'text' => $message->content
                    ]
                ]
            ];
        }

        // Adiciona arquivos ao último chat
        $files = $request->file('files');
        if ($files) {
            $inlineData = $this->processFiles($files);
            $lastIndex = count($parts) - 1;
            $parts[$lastIndex]['parts'][] = $inlineData;
        }

        return $parts;
    }

    /**
     * Processa os arquivos e converte para formato inline_data
     *
     * @param array $files
     * @return array
     */
    protected function processFiles(array $files): array
    {
        $inlineData = [];

        foreach ($files as $file) {
            $fileContent = $file->get();
            $base64File = base64_encode($fileContent);

            $inlineData[] = [
                'inline_data' => [
                    'mime_type' => $file->getMimeType(),
                    'data' => $base64File
                ]
            ];
        }

        return $inlineData;
    }

    /**
     * Constrói os dados da requisição
     *
     * @param Agent $agent
     * @param array $parts
     * @return array
     */
    protected function buildRequestData(?Agent $agent, array $parts): array
    {
        $requestData = $agent ? [
            'system_instruction' => [
                'parts' => [
                    [
                        'text' => $agent->description
                    ]
                ]
            ],
            'contents' => $parts
        ] : [
            'contents' => $parts
        ];

        return $requestData;
    }

    /**
     * Constrói a configuração de JSON schema
     *
     * @param Agent $agent
     * @return array
     */
    protected function buildJsonSchemaConfig(Agent $agent): array
    {
        // Se json_schema já é um array, usa diretamente; caso contrário, decodifica
        $schemaProperties = is_array($agent->json_schema)
            ? $agent->json_schema
            : json_decode($agent->json_schema, true);

        return [
            'response_mime_type' => 'application/json',
            'response_schema' => [
                'type' => 'ARRAY',
                'items' => [
                    'type' => 'OBJECT',
                    'properties' => $schemaProperties,
                    'propertyOrdering' => array_keys($schemaProperties)
                ]
            ]
        ];
    }

    /**
     * Envia a requisição para a API do Gemini
     *
     * @param array $requestData
     * @return \Illuminate\Http\Client\Response
     * @throws \Exception
     */
    protected function sendRequest(array $requestData): \Illuminate\Http\Client\Response
    {
        try {
            return Http::withHeaders([
                'x-goog-api-key' => env('GEMINI_API_KEY'),
                'Content-Type' => 'application/json',
            ])->post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', $requestData);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage());
        }
    }

    /**
     * Extrai os dados da resposta
     *
     * @param \Illuminate\Http\Client\Response $response
     * @return string
     * @throws \Exception
     */
    protected function extractResponseData(\Illuminate\Http\Client\Response $response): string
    {
        $responseData = $response->json();

        if (!isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
            throw new \Exception('Invalid response from Gemini API: ' . json_encode($responseData));
        }

        return $responseData['candidates'][0]['content']['parts'][0]['text'];
    }

    /**
     * Parseia a resposta baseado no tipo de schema
     *
     * @param Agent $agent
     * @param string $responseData
     * @return array|string
     */
    protected function parseResponse(Agent $agent, string $responseData): array|string
    {
        if ($agent->json_schema) {
            return json_decode($responseData, true);
        }

        return $responseData;
    }
}
