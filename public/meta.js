// public/meta.js
document.addEventListener('DOMContentLoaded', () => {
    
    // Complete mapping of brawler names to their image IDs for Brawlify CDN
    const brawlerImageIds = {
        "SHELLY": 16000000,
        "COLT": 16000001,
        "BULL": 16000002,
        "BROCK": 16000003,
        "RICO": 16000004,
        "SPIKE": 16000005,
        "BARLEY": 16000006,
        "JESSIE": 16000007,
        "NITA": 16000008,
        "DYNAMIKE": 16000009,
        "EL PRIMO": 16000010,
        "MORTIS": 16000011,
        "CROW": 16000012,
        "POCO": 16000013,
        "BO": 16000014,
        "PIPER": 16000015,
        "PAM": 16000016,
        "TARA": 16000017,
        "DARRYL": 16000018,
        "PENNY": 16000019,
        "FRANK": 16000020,
        "GENE": 16000021,
        "TICK": 16000022,
        "LEON": 16000023,
        "ROSA": 16000024,
        "CARL": 16000025,
        "BIBI": 16000026,
        "8-BIT": 16000027,
        "SANDY": 16000028,
        "BEA": 16000029,
        "EMZ": 16000030,
        "MR. P": 16000031,
        "MAX": 16000032,
        "JACKY": 16000034,
        "GALE": 16000035,
        "NANI": 16000036,
        "SPROUT": 16000037,
        "SURGE": 16000038,
        "COLETTE": 16000039,
        "AMBER": 16000040,
        "LOU": 16000041,
        "BYRON": 16000042,
        "EDGAR": 16000043,
        "RUFFS": 16000044,
        "STU": 16000045,
        "BELLE": 16000046,
        "SQUEAK": 16000047,
        "GROM": 16000048,
        "BUZZ": 16000049,
        "GRIFF": 16000050,
        "ASH": 16000051,
        "MEG": 16000052,
        "LOLA": 16000053,
        "FANG": 16000054,
        "EVE": 16000056,
        "JANET": 16000057,
        "BONNIE": 16000058,
        "OTIS": 16000059,
        "SAM": 16000060,
        "GUS": 16000061,
        "BUSTER": 16000062,
        "CHESTER": 16000063,
        "GRAY": 16000064,
        "MANDY": 16000065,
        "R-T": 16000066,
        "WILLOW": 16000067,
        "MAISIE": 16000068,
        "HANK": 16000069,
        "CORDELIUS": 16000070,
        "DOUG": 16000071,
        "PEARL": 16000072,
        "CHUCK": 16000073,
        "CHARLIE": 16000074,
        "MICO": 16000075,
        "KIT": 16000076,
        "LARRY & LAWRIE": 16000077,
        "MELODIE": 16000078,
        "ANGELO": 16000079,
        "DRACO": 16000080,
        "BERRY": 16000081,
        "CLANCY": 16000082,
        "MOE": 16000083,
        "KENJI": 16000084,
        "SHADE": 16000085,
        "JUJU": 16000086,
        "OLLIE": 16000087,
        "MEEPLE": 16000088
    };

    const metaData = {
        sTier: ["Cordelius", "Melodie", "Angelo"],
        aTier: ["Spike", "Shelly", "Piper"],
        bTier: ["Colt", "Jessie", "Nita"],
        weakest: [
            { name: "Doug", reason: "Short range and heavily outclassed by other healers and tanks." },
            { name: "Hank", reason: "Very situational and easy to counter once his bubble is popped." },
            { name: "Frank", reason: "Struggles against current top meta picks due to low mobility and slow reload speed." }
        ],
        solo: [
            { name: "Shelly", badges: ["Easy Value", "Control"], desc: "High burst damage and mobility makes it easy to secure kills independently." },
            { name: "Spike", badges: ["Damage", "Anti-Tank"], desc: "Excellent damage output and slow makes him a threat to anyone." },
            { name: "Leon", badges: ["Self-sufficient", "Survivability"], desc: "Great for carrying randoms without needing healers or coordination." }
        ],
        team: [
            { name: "Sandy", badges: ["Control", "Support"], desc: "Super provides incredible team-wide stealth and area control." },
            { name: "Max", badges: ["Synergy", "Speed"], desc: "Combos perfectly with tanks and assassins to quickly wipe the enemy team." },
            { name: "Byron", badges: ["Support", "Healer"], desc: "Provides essential healing and buffs, multiplying the effectiveness of the team." }
        ],
        gameModes: [
            { name: "💎 Gem Grab", picks: ["Sandy", "Tara", "Rico"], text: "Focus on mid-control and safe gem carriers." },
            { name: "⚽ Brawl Ball", picks: ["Cordelius", "Jacky", "Poco"], text: "Tanks and wall-breakers dominate here." },
            { name: "☠️ Knockout", picks: ["Piper", "Angelo", "Nani"], text: "Long-range snipers and careful assassins shine." },
            { name: "🔥 Hot Zone", picks: ["Sandy", "Lou", "Amber"], text: "Area denial and high survivability is key." },
            { name: "🏦 Heist", picks: ["Melodie", "Colette", "Jessie"], text: "High sustained DPS and base-racing potential." },
            { name: "💀 Showdown", picks: ["Cordelius", "Leon", "Surge"], text: "Assassins, campers, and anti-tank brawlers." }
        ]
    };

    function getImgHtml(name) {
        const uppercaseName = name.toUpperCase();
        const id = brawlerImageIds[uppercaseName];
        if (id) {
            const url = `https://cdn.brawlify.com/brawlers/borderless/${id}.png`;
            return `<img src="${url}" alt="${name}" class="card-brawler-img" onerror="this.style.display='none'">`;
        }
        return '<div class="card-brawler-img" style="background:#334155; display:inline-block;"></div>'; // Fallback
    }

    // Helper function to build tier tags
    function renderTier(containerId, brawlerArray) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = ''; // clear any existing
        
        brawlerArray.forEach(name => {
            const div = document.createElement('div');
            div.className = 'tier-brawler';
            div.innerHTML = `${getImgHtml(name)} <span>${name}</span>`;
            container.appendChild(div);
        });
    }

    renderTier('tier-s-container', metaData.sTier);
    renderTier('tier-a-container', metaData.aTier);
    renderTier('tier-b-container', metaData.bTier);

    // Weakest Brawlers
    const weakestContainer = document.getElementById('weakest-container');
    if (weakestContainer) {
        weakestContainer.innerHTML = '';
        metaData.weakest.forEach(b => {
            const card = document.createElement('div');
            card.className = 'meta-card';
            card.innerHTML = `
                <div class="card-header-row">
                    ${getImgHtml(b.name)}
                    <h3>${b.name}</h3>
                </div>
                <p>${b.reason}</p>
            `;
            weakestContainer.appendChild(card);
        });
    }

    // Solo Queue
    const soloContainer = document.getElementById('solo-container');
    if (soloContainer) {
        soloContainer.innerHTML = '';
        metaData.solo.forEach(b => {
            const card = document.createElement('div');
            card.className = 'meta-card solo-card';
            const badgesHtml = b.badges.map(badge => `<span class="badge">${badge}</span>`).join('');
            card.innerHTML = `
                <div class="card-header-row">
                    ${getImgHtml(b.name)}
                    <h3>${b.name}</h3>
                </div>
                <div class="meta-badges">${badgesHtml}</div>
                <p>${b.desc}</p>
            `;
            soloContainer.appendChild(card);
        });
    }

    // Team Picks
    const teamContainer = document.getElementById('team-container');
    if (teamContainer) {
        teamContainer.innerHTML = '';
        metaData.team.forEach(b => {
            const card = document.createElement('div');
            card.className = 'meta-card team-card';
            const badgesHtml = b.badges.map(badge => `<span class="badge badge-purple">${badge}</span>`).join('');
            card.innerHTML = `
                <div class="card-header-row">
                    ${getImgHtml(b.name)}
                    <h3>${b.name}</h3>
                </div>
                <div class="meta-badges">${badgesHtml}</div>
                <p>${b.desc}</p>
            `;
            teamContainer.appendChild(card);
        });
    }

    // Game Modes
    const modesContainer = document.getElementById('modes-container');
    if (modesContainer) {
        modesContainer.innerHTML = '';
        metaData.gameModes.forEach(m => {
            const card = document.createElement('div');
            card.className = 'mode-card';
            card.innerHTML = `
                <h3>${m.name}</h3>
                <p><strong>Top Picks:</strong> ${m.picks.join(', ')}</p>
                <p class="meta-subtext">${m.text}</p>
            `;
            modesContainer.appendChild(card);
        });
    }
});
