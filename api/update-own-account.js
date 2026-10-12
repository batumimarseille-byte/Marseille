import { createClient } from "@supabase/supabase-js";

function sendJson(response, status, payload) {
  response.status(status).json(payload);
}

function getBearerToken(request) {
  const authorization = request.headers.authorization || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
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

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Use POST." });
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

  const userId = sessionUserData.user.id;
  const currentEmail = cleanEmail(sessionUserData.user.email);
  const nextEmail = cleanEmail(request.body?.email);
  const password = String(request.body?.password || "");

  try {
    const { data: profile, error: profileError } = await supabase
      .from("hotel_users")
      .select("id, is_active")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!profile) return sendJson(response, 403, { error: "Active hotel profile was not found." });

    const authChanges = {};
    if (nextEmail) {
      if (!nextEmail.includes("@")) {
        return sendJson(response, 400, { error: "A valid email is required." });
      }
      if (nextEmail !== currentEmail) {
        const emailOwner = await findAuthUserByEmail(supabase, nextEmail);
        if (emailOwner && emailOwner.id !== userId) {
          return sendJson(response, 409, { error: "This email is already used by another account." });
        }
        authChanges.email = nextEmail;
        authChanges.email_confirm = true;
      }
    }
    if (password) {
      if (password.length < 6) {
        return sendJson(response, 400, { error: "Password must contain at least 6 characters." });
      }
      authChanges.password = password;
    }

    if (!Object.keys(authChanges).length) {
      return sendJson(response, 200, { ok: true, email: currentEmail });
    }

    const { data: updatedAuthData, error: updateAuthError } = await supabase.auth.admin.updateUserById(userId, authChanges);
    if (updateAuthError) throw updateAuthError;

    return sendJson(response, 200, {
      ok: true,
      email: updatedAuthData.user?.email || nextEmail || currentEmail,
    });
  } catch (error) {
    return sendJson(response, 500, { error: error?.message || "Could not update account." });
  }
}
