import { fetchCoinInfo } from "@/lib/adapters/coinInfo";
import { VALID_CODES } from "@/lib/constants";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").toUpperCase();

  if (!VALID_CODES.has(code)) {
    return Response.json({ error: "Kode koin tidak valid" }, { status: 400 });
  }

  const info = await fetchCoinInfo(code);

  if (!info) {
    return Response.json(
      { error: "Gagal mengambil info koin" },
      { status: 502 },
    );
  }

  return Response.json({ info });
}
