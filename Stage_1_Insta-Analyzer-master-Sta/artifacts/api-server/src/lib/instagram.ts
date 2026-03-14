import axios from "axios";

export interface InstagramProfile {
  username: string;
  fullName: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  isVerified: boolean;
  isPrivate: boolean;
  isBusinessAccount: boolean;
  profilePicUrl: string;
  engagementRate: number;
  avgLikes: number;
  avgComments: number;
  accountCategory: string;
  externalUrl: string;
}

function calcEngagement(followers: number, avgLikes: number, avgComments: number): number {
  if (followers <= 0) return 0;
  return parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2));
}

function extractAvgLikesComments(recentMedia: any[]): { avgLikes: number; avgComments: number } {
  if (!recentMedia || recentMedia.length === 0) return { avgLikes: 0, avgComments: 0 };
  const totalLikes = recentMedia.reduce((sum: number, edge: any) => {
    const node = edge.node ?? edge;
    return sum + (node.edge_liked_by?.count ?? node.like_count ?? node.likes_count ?? 0);
  }, 0);
  const totalComments = recentMedia.reduce((sum: number, edge: any) => {
    const node = edge.node ?? edge;
    return sum + (node.edge_media_to_comment?.count ?? node.comment_count ?? node.comments_count ?? 0);
  }, 0);
  return {
    avgLikes: totalLikes / recentMedia.length,
    avgComments: totalComments / recentMedia.length,
  };
}

function rapidHeaders(host: string) {
  return {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? "",
    "x-rapidapi-host": host,
  };
}

// ── Method A: Instagram internal web API (mimics Instagram app) ───────────────
async function tryInstagramWebApi(username: string): Promise<InstagramProfile> {
  const resp = await axios.get("https://i.instagram.com/api/v1/users/web_profile_info/", {
    params: { username },
    headers: {
      "User-Agent": "Instagram 275.0.0.27.98 Android (33/13; 420dpi; 1080x2400; samsung; SM-G991B; o1s; exynos2100; en_US; 458229237)",
      "X-IG-App-ID": "936619743392459",
      "X-ASBD-ID": "198387",
      "Accept-Language": "en-US",
      "Accept": "*/*",
    },
    timeout: 12000,
  });
  const data = resp.data?.data?.user;
  if (!data || !data.username) throw new Error("No user in Instagram web API");
  const followers = data.edge_followed_by?.count ?? 0;
  const following = data.edge_follow?.count ?? 0;
  const postsCount = data.edge_owner_to_timeline_media?.count ?? 0;
  const recentMedia = data.edge_owner_to_timeline_media?.edges ?? [];
  const { avgLikes, avgComments } = extractAvgLikesComments(recentMedia);
  return {
    username: data.username, fullName: data.full_name ?? "", bio: data.biography ?? "",
    followers, following, postsCount,
    isVerified: data.is_verified ?? false, isPrivate: data.is_private ?? false,
    isBusinessAccount: data.is_business_account ?? data.is_professional_account ?? false,
    profilePicUrl: data.profile_pic_url_hd ?? data.profile_pic_url ?? "",
    engagementRate: calcEngagement(followers, avgLikes, avgComments),
    avgLikes, avgComments,
    accountCategory: data.category_name ?? "", externalUrl: data.external_url ?? "",
  };
}

// ── Method B: instagram-looter2 (user IS subscribed — try multiple endpoints) ─
async function tryLooter2AccountInfo(username: string): Promise<InstagramProfile> {
  const resp = await axios.get("https://instagram-looter2.p.rapidapi.com/account-info", {
    params: { username },
    headers: rapidHeaders("instagram-looter2.p.rapidapi.com"),
    timeout: 12000,
  });
  // The API might return {status, user: {...}} or the user object directly
  const data = resp.data?.user ?? resp.data;
  if (!data || !data.username) throw new Error("No user data in looter2 account-info");
  const followers = data.follower_count ?? data.edge_followed_by?.count ?? 0;
  const following = data.following_count ?? data.edge_follow?.count ?? 0;
  const postsCount = data.media_count ?? 0;
  const { avgLikes, avgComments } = extractAvgLikesComments(data.edge_owner_to_timeline_media?.edges ?? []);
  return {
    username: data.username, fullName: data.full_name ?? "", bio: data.biography ?? "",
    followers, following, postsCount,
    isVerified: data.is_verified ?? false, isPrivate: data.is_private ?? false,
    isBusinessAccount: data.is_business_account ?? data.is_professional_account ?? false,
    profilePicUrl: data.profile_pic_url_hd ?? data.profile_pic_url ?? "",
    engagementRate: calcEngagement(followers, avgLikes, avgComments),
    avgLikes, avgComments,
    accountCategory: data.category_name ?? "", externalUrl: data.external_url ?? "",
  };
}

async function tryLooter2Profile(username: string): Promise<InstagramProfile> {
  const resp = await axios.get("https://instagram-looter2.p.rapidapi.com/profile", {
    params: { username },
    headers: rapidHeaders("instagram-looter2.p.rapidapi.com"),
    timeout: 12000,
  });
  const data = resp.data?.user ?? resp.data?.graphql?.user ?? resp.data;
  if (!data || !data.username) throw new Error("No user data in looter2 profile");
  const followers = data.edge_followed_by?.count ?? data.follower_count ?? 0;
  const following = data.edge_follow?.count ?? data.following_count ?? 0;
  const postsCount = data.edge_owner_to_timeline_media?.count ?? data.media_count ?? 0;
  const recentMedia = data.edge_owner_to_timeline_media?.edges ?? [];
  const { avgLikes, avgComments } = extractAvgLikesComments(recentMedia);
  return {
    username: data.username, fullName: data.full_name ?? "", bio: data.biography ?? "",
    followers, following, postsCount,
    isVerified: data.is_verified ?? false, isPrivate: data.is_private ?? false,
    isBusinessAccount: data.is_business_account ?? data.is_professional_account ?? false,
    profilePicUrl: data.profile_pic_url_hd ?? data.profile_pic_url ?? "",
    engagementRate: calcEngagement(followers, avgLikes, avgComments),
    avgLikes, avgComments,
    accountCategory: data.category_name ?? data.category ?? "", externalUrl: data.external_url ?? "",
  };
}

// ── Other RapidAPI endpoints ───────────────────────────────────────────────────
async function tryRapid1(username: string): Promise<InstagramProfile> {
  const resp = await axios.get("https://instagram-scraper-api2.p.rapidapi.com/v1/info", {
    params: { username_or_id_or_url: username },
    headers: rapidHeaders("instagram-scraper-api2.p.rapidapi.com"),
    timeout: 12000,
  });
  const data = resp.data?.data;
  if (!data || !data.username) throw new Error("No data");
  const followers = data.follower_count ?? data.edge_followed_by?.count ?? 0;
  const following = data.following_count ?? data.edge_follow?.count ?? 0;
  const postsCount = data.media_count ?? 0;
  const { avgLikes, avgComments } = extractAvgLikesComments(data.edge_owner_to_timeline_media?.edges ?? []);
  return {
    username: data.username, fullName: data.full_name ?? "", bio: data.biography ?? "",
    followers, following, postsCount,
    isVerified: data.is_verified ?? false, isPrivate: data.is_private ?? false,
    isBusinessAccount: data.is_business_account ?? data.is_professional_account ?? false,
    profilePicUrl: data.profile_pic_url_hd ?? data.profile_pic_url ?? "",
    engagementRate: calcEngagement(followers, avgLikes, avgComments),
    avgLikes, avgComments,
    accountCategory: data.category_name ?? "", externalUrl: data.external_url ?? "",
  };
}

async function tryRapid2(username: string): Promise<InstagramProfile> {
  const resp = await axios.get("https://instagram30.p.rapidapi.com/account/info", {
    params: { username },
    headers: rapidHeaders("instagram30.p.rapidapi.com"),
    timeout: 12000,
  });
  const data = resp.data?.data ?? resp.data;
  if (!data || !data.username) throw new Error("No data");
  const followers = data.follower_count ?? 0;
  const following = data.following_count ?? 0;
  const postsCount = data.media_count ?? 0;
  const { avgLikes, avgComments } = extractAvgLikesComments(data.edge_owner_to_timeline_media?.edges ?? []);
  return {
    username: data.username, fullName: data.full_name ?? "", bio: data.biography ?? "",
    followers, following, postsCount,
    isVerified: data.is_verified ?? false, isPrivate: data.is_private ?? false,
    isBusinessAccount: data.is_business_account ?? false,
    profilePicUrl: data.profile_pic_url_hd ?? data.profile_pic_url ?? "",
    engagementRate: calcEngagement(followers, avgLikes, avgComments),
    avgLikes, avgComments,
    accountCategory: data.category_name ?? "", externalUrl: data.external_url ?? "",
  };
}

async function tryRapid3(username: string): Promise<InstagramProfile> {
  const resp = await axios.get("https://instagram-bulk-profile-scrapper.p.rapidapi.com/clients/api/ig/ig_profile", {
    params: { ig: username, response_type: "short", corsEnabled: "false" },
    headers: rapidHeaders("instagram-bulk-profile-scrapper.p.rapidapi.com"),
    timeout: 12000,
  });
  const arr = resp.data;
  const data = Array.isArray(arr) ? arr[0] : arr;
  if (!data || !data.username) throw new Error("No data");
  return {
    username: data.username, fullName: data.full_name ?? "", bio: data.biography ?? "",
    followers: data.follower_count ?? 0, following: data.following_count ?? 0, postsCount: data.media_count ?? 0,
    isVerified: data.is_verified ?? false, isPrivate: data.is_private ?? false,
    isBusinessAccount: data.is_business ?? data.is_business_account ?? false,
    profilePicUrl: data.profile_pic_url ?? "",
    engagementRate: 0, avgLikes: 0, avgComments: 0,
    accountCategory: data.category ?? "", externalUrl: data.external_url ?? "",
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function fetchInstagramProfile(username: string): Promise<InstagramProfile> {
  const clean = username.replace(/^@/, "").trim().toLowerCase();
  if (!clean) throw new Error("Username is required");

  const apis = [
    { name: "instagram-web-api",        fn: () => tryInstagramWebApi(clean) },
    { name: "instagram-looter2/account",fn: () => tryLooter2AccountInfo(clean) },
    { name: "instagram-looter2/profile",fn: () => tryLooter2Profile(clean) },
    { name: "instagram-scraper-api2",   fn: () => tryRapid1(clean) },
    { name: "instagram30",              fn: () => tryRapid2(clean) },
    { name: "instagram-bulk-scrapper",  fn: () => tryRapid3(clean) },
  ];

  let lastError: any;
  const errors: Array<{ name: string; status?: number; msg: string }> = [];

  for (const api of apis) {
    try {
      console.log(`[Instagram] Trying ${api.name} for @${clean}...`);
      const result = await api.fn();
      console.log(`[Instagram] ${api.name} succeeded for @${clean}`);
      return result;
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message ?? err?.message ?? "unknown";
      console.warn(`[Instagram] ${api.name} failed (${status ?? msg}) for @${clean}`);
      lastError = err;
      errors.push({ name: api.name, status, msg });
    }
  }

  // Determine best error message based on what we saw
  const statuses = errors.map(e => e.status).filter(Boolean);
  const all403 = statuses.filter(s => s === 403 || s === 401).length;
  const any404 = statuses.filter(s => s === 404).length;

  // If the majority of attempts got 404, profile genuinely doesn't exist
  if (any404 >= 2 && all403 === 0) {
    throw new Error(`Profile @${clean} not found. Check the username spelling and make sure it's a public account.`);
  }

  // If mostly auth errors on RapidAPI
  if (all403 >= 3) {
    throw new Error(
      `RapidAPI subscription needed. Your key is valid but not subscribed to an Instagram API.\n` +
      `Fix: Go to rapidapi.com → search "instagram-looter2" → Subscribe free → try again.`
    );
  }

  throw new Error(
    lastError?.response?.data?.message ??
    lastError?.message ??
    "Could not fetch Instagram profile. Please try again."
  );
}
