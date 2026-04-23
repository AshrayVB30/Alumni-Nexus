import uvicorn
import socket

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == "__main__":
    local_ip = get_ip()
    print("\n" + "="*50)
    print("ALUMNI NEXUS BACKEND RUNNER")
    print("="*50)
    print(f"Computer IP: {local_ip}")
    print(f"API Base URL for Mobile: http://{local_ip}:8000/api/")
    print("="*50 + "\n")
    
    # Start uvicorn on 0.0.0.0 so it's accessible from mobile/other devices
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
