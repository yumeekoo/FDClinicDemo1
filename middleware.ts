import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith("/login");
  
  // Dashboard routes under (dashboard)
  const isDashboardPage =
    path === "/" ||
    path.startsWith("/reception") ||
    path.startsWith("/doctor") ||
    path.startsWith("/paraclinical") ||
    path.startsWith("/cashier") ||
    path.startsWith("/pharmacy") ||
    path.startsWith("/admin");

  if (isDashboardPage) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based route guard
    const role = user.user_metadata?.role;
    const branchId = user.user_metadata?.branch_id;

    // Check if branch is assigned
    if (!branchId && role !== "ADMIN") {
      // If no branch assigned, user must be prompted or assigned, for now redirect or allow
      // We can also allow admin without branch.
    }

    // Check role access
    if (path.startsWith("/admin") && role !== "ADMIN" && role !== "BRANCH_ADMIN") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), request.url));
    }
    if (path.startsWith("/reception") && role !== "RECEPTION" && role !== "ADMIN" && role !== "BRANCH_ADMIN") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), request.url));
    }
    if (path.startsWith("/doctor") && role !== "DOCTOR" && role !== "ADMIN" && role !== "BRANCH_ADMIN") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), request.url));
    }
    if (path.startsWith("/paraclinical") && role !== "PARACLINICAL" && role !== "ADMIN" && role !== "BRANCH_ADMIN") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), request.url));
    }
    if (path.startsWith("/cashier") && role !== "CASHIER" && role !== "ADMIN" && role !== "BRANCH_ADMIN") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), request.url));
    }
    if (path.startsWith("/pharmacy") && role !== "PHARMACIST" && role !== "ADMIN" && role !== "BRANCH_ADMIN") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), request.url));
    }

    // If at root page "/", redirect based on role
    if (path === "/") {
      return NextResponse.redirect(new URL(getRedirectUrlForRole(role), request.url));
    }
  }

  if (isAuthPage && user) {
    const role = user.user_metadata?.role;
    return NextResponse.redirect(new URL(getRedirectUrlForRole(role), request.url));
  }

  return response;
}

function getRedirectUrlForRole(role?: string): string {
  switch (role) {
    case "ADMIN":
    case "BRANCH_ADMIN":
      return "/admin";
    case "RECEPTION":
      return "/reception";
    case "DOCTOR":
      return "/doctor";
    case "PARACLINICAL":
      return "/paraclinical";
    case "CASHIER":
      return "/cashier";
    case "PHARMACIST":
      return "/pharmacy";
    default:
      // Default fallback for users without a role
      return "/unauthorized";
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (api routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
