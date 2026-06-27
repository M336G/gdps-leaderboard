const PAGE_SIZE = 50;

const GDPS_LIST = [
    { name: "GD Lightsync", gdpshub: 4259, discord: "mvbjWdC6cF" },
    { name: "Chi GDPS", gdpshub: 659, discord: "rZRFzGk9nf" },
    { name: "Statice", gdpshub: 7, discord: "TK2WWuUpTc" },
    { name: "DDOGDPS", gdpshub: 2265, discord: "VJQn4n9sNs" },
    { name: "Atlas GDPS", gdpshub: 2810, discord: "KxXjCJaX53" },
    { name: "Void GDPS", gdpshub: 2644, discord: "t5e6pPnK2G" },
    { name: "Platinum GDPS Reborn", gdpshub: 2173, discord: "nqNBZQXEGM" },
    { name: "Rick GDPS", gdpshub: 5598, discord: "ZcvdqTAr8" },
    { name: "Neopointfour", gdpshub: 2133, discord: "yvpuqBm" },
    { name: "WORST GDPS", gdpshub: 130, discord: "kCf5jQSNCm" },
    { name: "McGDPS", gdpshub: 106, discord: "p9dB4h8YZw" },
    { name: "SilvrPS", gdpshub: 8, discord: "vnC4Z5nKm3" },
    { name: "DindeGDPS", gdpshub: 4, discord: "sVcFBddjfj" },
    { name: "1.9 GDPS", discord: "eCGFrCG" },
    { name: "1.3 GDPS", gdpshub: 1407, discord: "BcptsnvDz6" },
    { name: "Cvolton GDPS", discord: "pYw57RQ" },
    { name: "1.0 GDPS (ascendddd)", discord: "FDthGT3BED" },
    { name: "Rageous LegacyGDPS", discord: "UT6jKFUYyK" },
    { name: "1.5 GDPS", discord: "gs4P8UAwDT" },
    { name: "CnekGDPS", discord: "ExMhNRkGEF" },
    { name: "1.2 GDPS", discord: "75hXKqNVum" },
    { name: "GDPS Editor 2.3", discord: "UzV6sUjM7w" },
    { name: "1.6 GDPS", gdpshub: 2234, discord: "t7DVGua2zw" },
    { name: "2.1 GDPS", gdpshub: 1898, discord: "N8MX2mZKCF" },
    { name: "Geometrix", gdpshub: 252, discord: "HCAvyVs" },
    { name: "KGDPS", gdpshub: 4571, discord: "3Up2nxbkSr" },
    { name: "Warp Dash", gdpshub: 5357, discord: "f28Hs6mZCb" },
    { name: "Geometry Dash Story Mode", discord: "njgdpkQ6WN" },
    { name: "1.8 GDPS", gdpshub: 4441, discord: "9NEz84gdHx" },
    { name: "gCPS", discord: "eZcynVMhrF" },
    { name: "WhirlGDPS", gdpshub: 2126, discord: "wD6hWJdvDR" },
    { name: "GDPS All Admin", gdpshub: 1081, discord: "wD6hWJdvDR" },
    { name: "1.0 GDPS (Nixion)", gdpshub: 2263, discord: "hsM4vyDU62" },
    { name: "KatVietGDPS", gdpshub: 5338, discord: "v5v9k5gB9x" }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function requestDiscordInfo(url, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const req = await fetch(url);

            if (req.status === 429) {
                const data = await req.json();
                const waitTime = (data.retry_after || 1) * 1000;

                console.warn(`Rate limited; retrying after ${waitTime}ms`);
                await sleep(waitTime);
                continue;
            }

            if (!req.ok)
                throw new Error(`Discord API request failed with code ${req.status}`);

            return await req.json();
        } catch (error) {
            if (attempt === maxRetries)
                throw error;

            await sleep(1000 * Math.pow(2, attempt));
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const gdps_list = [];
    const loadingText = document.getElementById("loading");

    for (const gdps of GDPS_LIST) {
        loadingText.textContent = `Loading... ${gdps.name}`;

        try {
            let data;
            const cachedRaw = localStorage.getItem(gdps.discord);

            if (cachedRaw) {
                const cached = JSON.parse(cachedRaw);
                if (Date.now() - cached.timestamp < 10 * 60 * 1000)
                    data = cached.data;
            }
            if (!data) {
                data = await requestDiscordInfo(`https://discord.com/api/v8/invites/${gdps.discord}?with_counts=true`);
                localStorage.setItem(gdps.discord, JSON.stringify({
                    timestamp: Date.now(),
                    data: {
                        approximate_member_count: data.approximate_member_count,
                        guild: { id: data.guild.id, icon: data.guild.icon }
                    }
                }));
            }

            gdps.count = data.approximate_member_count;
            gdps.url = gdps.gdpshub
                ? `https://gdpshub.com/gdps/${gdps.gdpshub}`
                : `https://discord.gg/${gdps.discord}`;
            gdps.icon = gdps.gdpshub
                ? `https://gdpshub.b-cdn.net/gdps/${gdps.gdpshub}/pfp`
                : `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.webp?size=80&quality=lossless`;

            gdps_list.push(gdps);
        } catch (error) {
            console.error(`Failed to fetch ${gdps.name}:`, error);
        }
    }

    const sorted = [...gdps_list].sort((a, b) => b.count - a.count);

    const leaderboard = document.getElementById("leaderboard");
    const pagination = document.getElementById("pagination");
    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    let currentPage = 0;

    function renderPage(page) {
        const start = page * PAGE_SIZE;
        const slice = sorted.slice(start, start + PAGE_SIZE);

        leaderboard.innerHTML = "";

        slice.forEach((gdps, i) => {
            const index = start + i;
            const entry = document.createElement("div");
            
            const medal = ["gold", "silver", "bronze"][index] ?? "";
            entry.className = `entry ${medal}`;
            
            entry.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <img src="${gdps.icon}" alt="${gdps.name}'s logo" width="45" height="45" style="border-radius: 50%;" onerror="this.src='assets/default-icon.webp'">
                <span class="name">
                    <a href="${gdps.url}" target="_blank">${gdps.name}</a>
                </span>
                <span class="stats">
                    <em><a href="https://discord.gg/${gdps.discord}" target="_blank">${gdps.count.toLocaleString()} members</a></em>
                </span>
            `;

            leaderboard.appendChild(entry);
        });

        document.getElementById("previous").disabled = page === 0;
        document.getElementById("next").disabled = page === totalPages - 1;
        document.getElementById("page-indicator").textContent = `${page + 1} out of ${totalPages}`;
    }

    document.getElementById("previous").addEventListener("click", () => {
        if (currentPage > 0) renderPage(--currentPage);
    });
    
    document.getElementById("next").addEventListener("click", () => {
        if (currentPage < totalPages - 1) renderPage(++currentPage);
    });

    document.getElementById("loading")?.remove();
    pagination.style.display = "flex";
    renderPage(0);

    const failed = GDPS_LIST.length - gdps_list.length;
    if (failed)
        document.getElementById("error-message").innerHTML = `<strong><u>${failed}</u> GDPSs could not be retrieved...</strong>`;
});