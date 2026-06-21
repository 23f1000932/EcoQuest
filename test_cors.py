import httpx
import asyncio

async def main():
    async with httpx.AsyncClient() as client:
        res = await client.options(
            "https://ecoquest-api-0yzn.onrender.com/api/auth/logout",
            headers={
                "Origin": "https://ecoquest-india.vercel.app",
                "Access-Control-Request-Method": "POST"
            }
        )
        print(f"Status: {res.status_code}")
        print("Headers:")
        for k, v in res.headers.items():
            print(f"  {k}: {v}")

if __name__ == "__main__":
    asyncio.run(main())
