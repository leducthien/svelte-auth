import { json, error } from "@sveltejs/kit";

export async function POST(event) { // event: RequestEvent; https://kit.svelte.dev/docs/types#public-types-requestevent
    let { slug } = event.params;
    let response;
    switch (slug) {
        case 'login':
            let requestBody = await event.request.json();
            let isAuthenticated = false;
            if(requestBody.email === 'timducle@yahoo.com' && requestBody.password === '12345678') {
                isAuthenticated = true;
            }
            if(isAuthenticated) {
                response = { message: 'Login successful' };
            } else {
                response = { message: 'Wrong email or password' };
            }
            
            break;
    
        default:
            throw error(404, 'Invalid endpoint'); // 404: Not Found
    }
    return json(response);
}