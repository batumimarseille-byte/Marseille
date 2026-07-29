import { createClient } from "@supabase/supabase-js";

const defaultCurrencyByCode = {
  GEL: "₾",
  USD: "$",
  EUR: "€",
};

const defaultGroupByType = {
  Suite: "lux",
  Standard: "standard",
  Twin: "two-beds",
  Triple: "three-beds",
  "Junior Suite": "semi-lux",
};

const defaultBookingColors = [
  "#4f7cff",
  "#9a6bf2",
  "#e978b7",
  "#ef6669",
  "#e89b43",
  "#75c95d",
  "#2fb8aa",
  "#36a4e9",
];

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function cleanText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function cleanLanguage(value) {
  return value === "ka" ? "ka" : "en";
}

function cleanCurrency(value) {
  const code = String(value || "GEL").trim().toUpperCase();
  return defaultCurrencyByCode[code] ? code : "GEL";
}

function cleanHexColor(value, fallback = "#4f7cff") {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

function normalizeRooms(rooms) {
  if (!Array.isArray(rooms)) return [];

  const seen = new Set();
  return rooms
    .map((room, index) => {
      const id = cleanText(room?.id);
      if (!id || seen.has(id)) return null;
      seen.add(id);

      const type = cleanText(room?.type, "Standard");
      const sortOrder = Number.isFinite(Number(room?.sortOrder))
        ? Number(room.sortOrder)
        : Number.parseInt(id, 10) || index + 1;

      return {
        id,
        type,
        group_name: cleanText(room?.groupName || room?.group, defaultGroupByType[type] || slugify(type) || "rooms"),
        sort_order: sortOrder,
        nightly_price: Math.max(Number(room?.nightlyPrice || 0), 0),
        is_active: room?.isActive !== false,
      };
    })
    .filter(Boolean);
}

async function findAuthUserByEmail(client, email) {
  const safeEmail = email.toLowerCase();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const user = data?.users?.find((item) => String(item.email || "").toLowerCase() === safeEmail);
    if (user) return user;
    if (!data?.users || data.users.length < 1000) return null;
    page += 1;
  }

  return null;
}

async function createOrUpdateAdminUser(client, admin) {
  const email = cleanText(admin?.email).toLowerCase();
  const password = String(admin?.password || "");
  const displayName = cleanText(admin?.displayName, email);

  if (!email || !email.includes("@")) {
    return { error: "Admin email is required." };
  }

  if (password.length < 6) {
    return { error: "Admin password must contain at least 6 characters." };
  }

  const existingUser = await findAuthUserByEmail(client, email);
  if (existingUser) {
    const { data, error } = await client.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    });

    if (error) return { error: error.message };
    return { user: data.user || existingUser };
  }

  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  });

  if (error) return { error: error.message };
  return { user: data.user };
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Use POST." });
  }

  const setupSecret = process.env.CREATE_HOTEL_SECRET;
  const providedSecret = request.headers["x-setup-secret"] || getBearerToken(request);

  if (!setupSecret || providedSecret !== setupSecret) {
    return sendJson(response, 401, { error: "Unauthorized setup request." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(response, 500, { error: "Missing server Supabase environment variables." });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const body = request.body || {};
  const hotel = body.hotel || {};
  const admin = body.admin || {};
  const rooms = normalizeRooms(body.rooms);
  const colors = Array.isArray(body.bookingColors) && body.bookingColors.length
    ? body.bookingColors.map((color) => cleanHexColor(color)).filter(Boolean)
    : defaultBookingColors;

  const hotelName = cleanText(hotel.name);
  const hotelSlug = slugify(hotel.slug || hotelName);
  const hotelId = slugify(hotel.id || hotelSlug);

  if (!hotelName || !hotelId || !hotelSlug) {
    return sendJson(response, 400, { error: "Hotel name is required." });
  }

  const currencyCode = cleanCurrency(hotel.currencyCode);
  const currencySymbol = cleanText(hotel.currencySymbol, defaultCurrencyByCode[currencyCode]);
  const logoUrl = cleanText(hotel.logoUrl, "/logo.png");
  const timezone = cleanText(hotel.timezone, "Asia/Tbilisi");
  const hotelLabel = cleanText(hotel.label, "Hotel");

  try {
    const adminResult = await createOrUpdateAdminUser(supabase, admin);
    if (adminResult.error) {
      return sendJson(response, 400, { error: adminResult.error });
    }

    const adminUser = adminResult.user;
    const { data: existingProfile, error: profileReadError } = await supabase
      .from("hotel_users")
      .select("id, hotel_id")
      .eq("user_id", adminUser.id)
      .maybeSingle();

    if (profileReadError) throw profileReadError;
    if (existingProfile?.hotel_id && existingProfile.hotel_id !== hotelId) {
      return sendJson(response, 409, {
        error: "This admin user is already linked to another hotel.",
        linkedHotelId: existingProfile.hotel_id,
      });
    }

    const { error: hotelError } = await supabase
      .from("hotels")
      .upsert({ id: hotelId, name: hotelName, slug: hotelSlug }, { onConflict: "id" });
    if (hotelError) throw hotelError;

    const { error: settingsError } = await supabase
      .from("hotel_settings")
      .upsert(
        {
          hotel_id: hotelId,
          hotel_name: hotelName,
          hotel_label: hotelLabel,
          logo_url: logoUrl,
          default_language: cleanLanguage(hotel.defaultLanguage),
          currency_code: currencyCode,
          currency_symbol: currencySymbol,
          timezone,
        },
        { onConflict: "hotel_id" }
      );
    if (settingsError) throw settingsError;

    if (rooms.length) {
      const { error: roomsError } = await supabase
        .from("rooms")
        .upsert(
          rooms.map((room) => ({ hotel_id: hotelId, ...room })),
          { onConflict: "hotel_id,id" }
        );
      if (roomsError) throw roomsError;
    }

    if (colors.length) {
      const uniqueColors = Array.from(new Set(colors));
      const { error: colorsError } = await supabase
        .from("booking_colors")
        .upsert(
          uniqueColors.map((color) => ({ hotel_id: hotelId, color })),
          { onConflict: "hotel_id,color" }
        );
      if (colorsError) throw colorsError;
    }

    const adminProfilePayload = {
      user_id: adminUser.id,
      hotel_id: hotelId,
      display_name: cleanText(admin.displayName, admin.email),
      position: cleanText(admin.position, "Administrator"),
      role: "admin",
      chat_color: cleanHexColor(admin.chatColor),
      is_active: true,
    };

    const adminProfileQuery = existingProfile
      ? supabase.from("hotel_users").update(adminProfilePayload).eq("id", existingProfile.id)
      : supabase.from("hotel_users").insert(adminProfilePayload);

    const { error: adminProfileError } = await adminProfileQuery;
    if (adminProfileError) throw adminProfileError;

    return sendJson(response, 200, {
      ok: true,
      hotelId,
      hotelSlug,
      adminEmail: adminUser.email,
      roomsCreatedOrUpdated: rooms.length,
      appUrl: `/?hotel=${hotelId}`,
    });
  } catch (error) {
    return sendJson(response, 500, {
      error: error?.message || "Could not create hotel.",
    });
  }
}
