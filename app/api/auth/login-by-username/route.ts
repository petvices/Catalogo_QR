// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
// import { cookies } from "next/headers"
// import { NextResponse } from "next/server"
// 
// export async function POST(request: Request) {
//   try {
//     const { username, password } = await request.json()
// 
//     if (!username || !password) {
//       return NextResponse.json(
//         { success: false, message: "Nombre de usuario y contraseña son requeridos" },
//         { status: 400 },
//       )
//     }
// 
//     // Crear cliente de Supabase con permisos de servicio
//     const supabaseAdmin = createRouteHandlerClient(
//       { cookies },
//       {
//         supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
//       },
//     )
// 
//     // Buscar el usuario por nombre de usuario en la tabla profiles
//     let profileData
//     let profileError
//     const { data: profileDataExact, error: profileErrorExact } = await supabaseAdmin
//       .from("profiles")
//       .select("id, email")
//       .eq("name", username)
//       .maybeSingle()
// 
//     console.log("Búsqueda de perfil por username:", { profileDataExact, profileErrorExact })
// 
//     if (profileErrorExact) {
//       console.error("Error al buscar perfil:", profileErrorExact)
//       return NextResponse.json(
//         { success: false, message: "Error al buscar usuario", error: profileErrorExact.message },
//         { status: 500 },
//       )
//     }
// 
//     if (!profileDataExact) {
//       // Si no encontramos por name exacto, intentamos con ILIKE (case insensitive)
//       const { data: profilesInsensitive } = await supabaseAdmin
//         .from("profiles")
//         .select("id, email")
//         .ilike("name", username)
//         .maybeSingle()
// 
//       if (!profilesInsensitive) {
//         // Si aún no encontramos, intentamos buscar en los metadatos de auth
//         const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
// 
//         const userWithUsername = usersData?.users?.find(
//           (user) =>
//             user.user_metadata?.name === username ||
//             user.user_metadata?.username === username ||
//             user.user_metadata?.name?.toLowerCase() === username.toLowerCase() ||
//             user.user_metadata?.username?.toLowerCase() === username.toLowerCase(),
//         )
// 
//         if (!userWithUsername) {
//           return NextResponse.json(
//             { success: false, message: "Usuario no encontrado. Verifica tu nombre de usuario." },
//             { status: 404 },
//           )
//         }
// 
//         if (!userWithUsername.email) {
//           return NextResponse.json(
//             { success: false, message: "No se pudo encontrar el email asociado a este usuario." },
//             { status: 404 },
//           )
//         }
// 
//         // Iniciar sesión con el email encontrado
//         const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
//           email: userWithUsername.email,
//           password,
//         })
// 
//         if (signInError) {
//           return NextResponse.json(
//             { success: false, message: signInError.message },
//             { status: signInError.status || 400 },
//           )
//         }
// 
//         // Establecer la cookie de sesión
//         const supabaseClient = createRouteHandlerClient({ cookies })
//         await supabaseClient.auth.signInWithPassword({
//           email: userWithUsername.email,
//           password,
//         })
// 
//         return NextResponse.json({ success: true })
//       } else {
//         // Usar el perfil encontrado con búsqueda insensible
//         profileData = profilesInsensitive
//       }
//     } else {
//       profileData = profileDataExact
//     }
// 
//     // Si encontramos el perfil pero no tiene email, buscamos el email en auth
//     if (!profileData.email) {
//       const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profileData.id)
// 
//       if (!userData?.user?.email) {
//         return NextResponse.json(
//           { success: false, message: "No se pudo encontrar el email asociado a este usuario." },
//           { status: 404 },
//         )
//       }
// 
//       // Iniciar sesión con el email encontrado
//       const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
//         email: userData.user.email,
//         password,
//       })
// 
//       if (signInError) {
//         return NextResponse.json(
//           { success: false, message: signInError.message },
//           { status: signInError.status || 400 },
//         )
//       }
// 
//       // Establecer la cookie de sesión
//       const supabaseClient = createRouteHandlerClient({ cookies })
//       await supabaseClient.auth.signInWithPassword({
//         email: userData.user.email,
//         password,
//       })
// 
//       return NextResponse.json({ success: true })
//     } else {
//       // Iniciar sesión con el email encontrado en el perfil
//       const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
//         email: profileData.email,
//         password,
//       })
// 
//       if (signInError) {
//         return NextResponse.json(
//           { success: false, message: signInError.message },
//           { status: signInError.status || 400 },
//         )
//       }
// 
//       // Establecer la cookie de sesión
//       const supabaseClient = createRouteHandlerClient({ cookies })
//       await supabaseClient.auth.signInWithPassword({
//         email: profileData.email,
//         password,
//       })
// 
//       return NextResponse.json({ success: true })
//     }
//   } catch (error: any) {
//     console.error("Error en login-by-username:", error)
//     return NextResponse.json(
//       { success: false, message: "Error interno del servidor", error: error.message },
//       { status: 500 },
//     )
//   }
// }
