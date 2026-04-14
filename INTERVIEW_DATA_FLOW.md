# Interview Transcript & Assessment Flow

## Where Data is Saved:

### Backend (FastAPI - MongoDB):
1. **Transcripts Collection**: `interview_transcripts`
   - Saved when interview ends (in `/api/interview/process-transcript`)
   - Contains: candidate_name, transcript (list of speaker/message), room_id, resume_text, jd_text, created_at

2. **Assessments Collection**: `interview_summaries`
   - Saved after Gemini generates assessment (in `/api/interview/process-transcript`)
   - Contains: candidate_name, summary (with scores & feedback), room_id, timestamp, transcript_id

### Frontend (Browser Memory):
- Summary data received via LiveKit data channel with topic "interview_summary"
- Displayed on EndScreen component after interview

## Flow:
1. Interview occurs in LiveKit room
2. Agent records conversation in `_conversation_history`
3. User ends call → participant disconnects
4. Agent calls `send_transcript_to_backend()` 
5. FastAPI receives POST to `/api/interview/process-transcript`
6. FastAPI saves transcript to MongoDB → `interview_transcripts`
7. FastAPI calls Gemini AI via OpenRouter for assessment
8. FastAPI saves assessment to MongoDB → `interview_summaries`
9. FastAPI returns summary to agent
10. Agent publishes summary to frontend via LiveKit data channel
11. Frontend receives and displays in EndScreen

## Debugging Endpoints:

- `GET /api/interview/transcripts` - See all saved transcripts
- `GET /api/interview/summaries` - See all saved assessments
- `GET /api/interview/transcript/{room_id}` - Get specific transcript
- `GET /api/interview/summary/{room_id}` - Get specific assessment
- `POST /api/interview/debug/api-status` - Check if services are configured

## Common Issues:

1. **OPENROUTER_API_KEY not set** → Assessment generation fails
2. **Database not connected** → Data not saved
3. **Agent not calling endpoint** → Transcript never sent
4. **Frontend not receiving data packet** → EndScreen shows no data
