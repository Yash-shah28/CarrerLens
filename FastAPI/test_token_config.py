import os
import json
from livekit.api import AccessToken, VideoGrants
from livekit.protocol.room import RoomConfiguration
from livekit.protocol.agent_dispatch import RoomAgentDispatch

# Simulate token generation
api_key = os.getenv("LIVEKIT_API_KEY", "APImZdAjqZARmJp")
api_secret = os.getenv("LIVEKIT_API_SECRET", "DgHHYZ1nQPerNoH8jBCnQdKfoR6fUbPN3QZMpRyabALB")

room_config = RoomConfiguration()
dispatch = RoomAgentDispatch()
dispatch.agent_name = "Interviewee"
room_config.agents.append(dispatch)

grant = VideoGrants(
    room_join=True,
    room="test-room",
    can_publish=True,
    can_subscribe=True,
    can_publish_data=True,
)

access_token = (
    AccessToken(api_key, api_secret)
    .with_grants(grant)
    .with_identity("test_user")
    .with_name("Test User")
)

# Try to set room_config
print(f"AccessToken type: {type(access_token)}")
print(f"Has room_config attribute: {hasattr(access_token, 'room_config')}")

access_token.room_config = room_config
print(f"room_config set successfully")
print(f"room_config value: {access_token.room_config}")

token = access_token.to_jwt()
print(f"\nToken generated successfully")
print(f"Token length: {len(token)}")

# Decode and inspect the token
import base64
parts = token.split('.')
if len(parts) >= 2:
    payload = parts[1]
    # Add padding if needed
    padding = 4 - len(payload) % 4
    if padding != 4:
        payload += '=' * padding
    decoded = base64.urlsafe_b64decode(payload)
    print(f"\nToken payload (decoded):\n{json.dumps(json.loads(decoded), indent=2)}")
