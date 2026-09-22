const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {

    console.log("AdminService loaded");


    // ============================================================
    // Configuration
    // ============================================================

    const baseUrl =
        "https://roeonline.chickenkiller.com/thirdparty";


    // ============================================================
    // Login to Third Party API
    // ============================================================

    async function getAdminSession() {

        const email =
            process.env.THIRD_PARTY_EMAIL;

        const password =
            process.env.THIRD_PARTY_PASSWORD;


        if (!email || !password) {

            throw new Error(
                "THIRD_PARTY_EMAIL and THIRD_PARTY_PASSWORD are not configured."
            );
        }


        console.log(
            "Logging into Third Party API..."
        );


        const loginResponse = await fetch(
            `${baseUrl}/admin/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );


        if (!loginResponse.ok) {

            const errorText =
                await loginResponse.text();

            throw new Error(
                `Third Party login failed (${loginResponse.status}): ${errorText}`
            );
        }


        console.log(
            "Third Party login successful."
        );


        // --------------------------------------------------------
        // Get session cookie
        // --------------------------------------------------------

        const setCookie =
            loginResponse.headers.get("set-cookie");


        if (!setCookie) {

            throw new Error(
                "Third Party API login succeeded but no Set-Cookie header was returned."
            );
        }


        const match =
            setCookie.match(
                /admin_session=([^;]+)/
            );


        if (!match) {

            throw new Error(
                "admin_session cookie was not found."
            );
        }


        const sessionCookie =
            `admin_session=${match[1]}`;


        console.log(
            "Admin session obtained."
        );


        return sessionCookie;
    }


    // ============================================================
    // Get Current Administrator
    // ============================================================

    async function getAdminMe() {

        const sessionCookie =
            await getAdminSession();


        console.log(
            "Requesting current admin profile..."
        );


        const response = await fetch(
            `${baseUrl}/admin/me`,
            {
                method: "GET",

                headers: {
                    "Cookie": sessionCookie
                }
            }
        );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                `Failed to retrieve admin profile (${response.status}): ${errorText}`
            );
        }


        const data =
            await response.json();


        console.log(
            "Current admin profile retrieved."
        );


        return data.admin;
    }


    // ============================================================
    // TEST CONNECTION
    // ============================================================

    this.on("testConnection", async () => {

        const admin =
            await getAdminMe();


        return JSON.stringify({
            success: true,
            admin: admin
        });
    });


    // ============================================================
    // READ CURRENT ADMIN
    // ============================================================

    this.on(
        "READ",
        "CurrentAdmin",
        async () => {

            const admin =
                await getAdminMe();


            if (!admin) {

                throw new Error(
                    "No administrator profile was returned."
                );
            }


            return [{
                ID: admin.id,

                Email: admin.email,

                First_Name: admin.first_name,

                Last_Name: admin.last_name,

                Role: admin.role,

                Is_Active: admin.is_active,

                Created_At: admin.created_at,

                Updated_At: admin.updated_at
            }];
        }
    );

});