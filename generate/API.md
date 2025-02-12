# Brainrot.js API Documentation

## Video Generation Endpoint

### POST /generate-video

Generates a video featuring a conversation between two AI agents on a specified topic.

#### Request Body

```json
{
    "videoTopic": "string",     // The topic of conversation
    "agentA": "string",         // First AI agent (see Valid Agents below)
    "agentB": "string",         // Second AI agent (must be different from agentA)
    "music": "string",          // Background music selection
    "background": "string",     // Background video selection
    "aiGeneratedImages": true,  // Optional: Whether to generate AI images (default: true)
    "fps": 20,                 // Optional: Frames per second (default: 20)
    "duration": 1,             // Optional: Duration in minutes (default: 1)
    "cleanSrt": true           // Optional: Whether to clean SRT files (default: true)
}
```

#### Valid Options

##### Agents
- BARACK_OBAMA
- BEN_SHAPIRO
- JORDAN_PETERSON
- JOE_ROGAN
- DONALD_TRUMP
- MARK_ZUCKERBERG
- JOE_BIDEN
- LIL_YACHTY
- RICK_SANCHEZ

##### Music
- WII_SHOP_CHANNEL_TRAP
- FLUFFING_A_DUCK
- MONKEYS_SPINNING_MONKEYS

##### Backgrounds
- MINECRAFT
- SUBWAY

#### Response

```json
{
    "status": "processing",
    "job_id": "string",
    "message": "Video generation started. The process will continue in the background."
}
```

#### Error Response

```json
{
    "error": "string"  // Error message describing what went wrong
}
```

#### Example Request

```bash
curl -X POST http://localhost:5000/generate-video \
  -H "Content-Type: application/json" \
  -d '{
    "videoTopic": "Discussing the importance of exercise",
    "agentA": "JOE_ROGAN",
    "agentB": "JORDAN_PETERSON",
    "music": "WII_SHOP_CHANNEL_TRAP",
    "background": "MINECRAFT"
  }'
``` 