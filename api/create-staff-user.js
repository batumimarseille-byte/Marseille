import { createClient } from "@supabase/supabase-js";

const staffRoles = new Set(["admin", "staff"]);
const profileFields = "id, user_id, hotel_id, display_name, role, position, avatar_url, chat_color, is_active";

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function cleanText(value, fallback = "") {
  const text = String(value || "").trim();
  return text || fallback;
}

function cleanHexColor(value, fallback = "#4f7cff") {
  const color = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
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

async function verifyHotelAdmin(client, userId, hotelId) {
  const { data, error } = await client
    .from("hotel_users")
    .select("id")
    .eq("user_id", userId)
    .eq("hotel_id", hotelId)
    .eq("role", "admin")
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function listHotelStaff(client, hotelId) {
  const { data: profiles, error } = await client
    .from("hotel_users")
    .select(profileFields)
    .eq("hotel_id", hotelId)
    .order("display_name", { ascending: true });

  if (error) throw error;

  return Promise.all(
    (profiles || []).map(async (profile) => {
      const { data } = await client.auth.admin.getUserById(profile.user_id);
      return { ...profile, email: data?.user?.email || "" };
    })
  );
}

export default async function handler(request, response) {
  if (!new Set(["GET", "POST"]).has(request.method)) {
    response.setHeader("Allow", "GET, POST");
    return sendJson(response, 405, { error: "Use GET or POST." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return sendJson(response, 500, { error: "Missing server Supabase environment variables." });
  }

  const accessToken = getBearerToken(request);
  if (!accessToken) return sendJson(response, 401, { error: "Missing user session." });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: sessionUserData, error: sessionUserError } = await supabase.auth.getUser(accessToken);
  if (sessionUserError || !sessionUserData?.user) {
    return sendJson(response, 401, { error: "Invalid user session." });
  }

  const body = request.body || {};
  const hotelId = cleanText(request.method === "GET" ? request.query?.hotelId : body.hotelId);
  if (!hotelId) return sendJson(response, 400, { error: "Hotel id is required." });

  try {
    const isAdmin = await verifyHotelAdmin(supabase, sessionUserData.user.id, hotelId);
    if (!isAdmin) {
      return sendJson(response, 403, { error: "Only active hotel admins can manage staff users." });
    }

    if (request.method === "GET") {
      const users = await listHotelStaff(supabase, hotelId);
      return sendJson(response, 200, { users });
    }

    const staffId = cleanText(body.staffId);
    const email = cleanText(body.email).toLowerCase();
    const password = String(body.password || "");
    const displayName = cleanText(body.displayName, email);
    const position = cleanText(body.position);
    const role = staffRoles.has(body.role) ? body.role : "staff";
    const chatColor = cleanHexColor(body.chatColor);

    if (!email || !email.includes("@")) {
      return sendJson(response, 400, { error: "Staff email is required." });
    }
    if ((!staffId || password) && password.length < 6) {
      return sendJson(response, 400, { error: "Password must contain at least 6 characters." });
    }

    if (staffId) {
      const { data: targetProfile, error: targetError } = await supabase
        .from("hotel_users")
        .select(profileFields)
        .eq("id", staffId)
        .eq("hotel_id", hotelId)
        .maybeSingle();
      if (targetError) throw targetError;
      if (!targetProfile) return sendJson(response, 404, { error: "Staff member was not found." });

      const { data: targetAuthData, error: targetAuthError } = await supabase.auth.admin.getUserById(targetProfile.user_id);
      if (targetAuthError || !targetAuthData?.user) throw targetAuthError || new Error("Staff login was not found.");

      const emailOwner = await findAuthUserByEmail(supabase, email);
      if (emailOwner && emailOwner.id !== targetProfile.user_id) {
        return sendJson(response, 409, { error: "This email is already used by another account." });
      }

      const authChanges = {
        email,
        email_confirm: true,
        user_metadata: { ...targetAuthData.user.user_metadata, display_name: displayName },
      };
      if (password) authChanges.password = password;

      const { data: updatedAuthData, error: updateAuthError } = await supabase.auth.admin.updateUserById(
        targetProfile.user_id,
        authChanges
      );
      if (updateAuthError) throw updateAuthError;

      const { data: savedProfile, error: savedProfileError } = await supabase
        .from("hotel_users")
        .update({ display_name: displayName, role })
        .eq("id", staffId)
        .eq("hotel_id", hotelId)
        .select(profileFields)
        .single();
      if (savedProfileError) throw savedProfileError;

      return sendJson(response, 200, {
        ok: true,
        user: { ...savedProfile, email: updatedAuthData.user?.email || email },
      });
    }

    const existingUser = await findAuthUserByEmail(supabase, email);
    let staffUser = existingUser;

    if (existingUser) {
      const { data: existingProfile, error: existingProfileError } = await supabase
        .from("hotel_users")
        .select("id, hotel_id")
        .eq("user_id", existingUser.id)
        .maybeSingle();
      if (existingProfileError) throw existingProfileError;
      if (existingProfile?.hotel_id && existingProfile.hotel_id !== hotelId) {
        return sendJson(response, 409, { error: "This user is already linked to another hotel." });
      }

      const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
        user_metadata: { ...existingUser.user_metadata, display_name: displayName },
      });
      if (error) throw error;
      staffUser = data.user || existingUser;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: displayName },
      });
      if (error) throw error;
      staffUser = data.user;
    }

    const { data: savedProfile, error: savedProfileError } = await supabase
      .from("hotel_users")
      .upsert(
        {
          user_id: staffUser.id,
          hotel_id: hotelId,
          display_name: displayName,
          role,
          position,
          chat_color: chatColor,
          is_active: true,
        },
        { onConflict: "user_id" }
      )
      .select(profileFields)
      .single();
    if (savedProfileError) throw savedProfileError;

    return sendJson(response, 200, {
      ok: true,
      user: { ...savedProfile, email: staffUser.email || email },
    });
  } catch (error) {
    return sendJson(response, 500, { error: error?.message || "Could not save staff user." });
  }
}
