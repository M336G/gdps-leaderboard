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
    { name: "PixelDash", gdpshub: 5703, discord: "bKGys8dUBv" },
    { name: "SilvrPS", gdpshub: 8, discord: "vnC4Z5nKm3" },
    { name: "DindeGDPS", gdpshub: 4, discord: "sVcFBddjfj" },
    { name: "GreenCatsServer", gdpshub: 80, discord: "GAk2nA8" },
    { name: "1.9 GDPS", discord: "eCGFrCG" },
    { name: "1.3 GDPS", gdpshub: 1407, discord: "BcptsnvDz6" }
];

document.addEventListener("DOMContentLoaded", async () => {
    const gdps_list = [];

    for (const gdps of GDPS_LIST) {
        try {
            const req = await fetch(`https://discord.com/api/v8/invites/${gdps.discord}?with_counts=true`);
            if (!req.ok)
                throw new Error(`Discord API failed with code ${req.status}`);
        
            const data = await req.json();

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