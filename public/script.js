document.addEventListener('DOMContentLoaded', () => {
    // Determine which page we are on
    const isMetaPage = document.getElementById('tier-s-container') !== null;

    if (!isMetaPage) {
        initPlayerLookup();
    } else {
        initMetaGuide();
    }
});

function initPlayerLookup() {
    // Views
    const searchView = document.getElementById('search-view');
    const dashboardView = document.getElementById('dashboard-view');

    // Forms & Inputs
    const searchForm = document.getElementById('searchForm');
    const input = document.getElementById('player-tag');
    const errorMsg = document.getElementById('error-message');
    const loading = document.getElementById('loading');
    const searchAgainBtn = document.getElementById('search-again-btn');
    const copyTagBtn = document.getElementById('copy-tag-btn');

    // Guide Modal
    const guideModal = document.getElementById('guide-modal');
    const openGuideBtn = document.getElementById('open-guide');
    const closeGuideBtn = document.getElementById('close-guide');

    // New Feature Elements
    const recentContainer = document.getElementById('recent-searches-container');
    const recentTagsDiv = document.getElementById('recent-tags');
    
    const compareBtn = document.getElementById('compare-btn');
    const compTag1 = document.getElementById('compare-tag-1');
    const compTag2 = document.getElementById('compare-tag-2');
    const compareView = document.getElementById('compare-view');
    const backFromCompareBtn = document.getElementById('back-from-compare-btn');
    const compareLoading = document.getElementById('compare-loading');
    const compareError = document.getElementById('compare-error');
    const compareResults = document.getElementById('compare-results');
    
    const snapshotBtn = document.getElementById('snapshot-btn');
    const recommendationsContainer = document.getElementById('recommendations-container');
    let currentPlayerStats = null;

    // DOM Elements - Header
    const resName = document.getElementById('res-name');
    const resTag = document.getElementById('res-tag');
    const headTrophies = document.getElementById('head-trophies');
    const headHighest = document.getElementById('head-highest');
    const playerIcon = document.getElementById('player-icon');

    // DOM Elements - Progress
    const collectionCount = document.getElementById('collection-count');
    const collectionFill = document.getElementById('collection-fill');
    const collectionPercent = document.getElementById('collection-percent');

    // DOM Elements - Breakdowns
    const bd1000 = document.getElementById('bd-1000');
    const bd750 = document.getElementById('bd-750');
    const bd500 = document.getElementById('bd-500');
    const bd300 = document.getElementById('bd-300');

    // DOM Elements - Overview Stats
    const resClub = document.getElementById('res-club');
    const resLevel = document.getElementById('res-level');
    const res3v3 = document.getElementById('res-3v3');
    const resSolo = document.getElementById('res-solo');
    const resDuo = document.getElementById('res-duo');

    // DOM Elements - Brawlers & About
    const topBrawlersContainer = document.getElementById('top-brawlers-container');
    const aboutText = document.getElementById('about-text');

    const TOTAL_BRAWLERS = 104; // Adjust as new brawlers are added to the game

    const formatNum = (num) => new Intl.NumberFormat('en-US').format(num);

    // Initialize Recent Searches
    loadRecentSearches();

    // Modal Logic
    if (openGuideBtn) openGuideBtn.addEventListener('click', () => guideModal.classList.remove('hidden'));
    if (closeGuideBtn) closeGuideBtn.addEventListener('click', () => guideModal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === guideModal) guideModal.classList.add('hidden');
    });

    // Switch Views
    if (searchAgainBtn) {
        searchAgainBtn.addEventListener('click', () => {
            dashboardView.classList.remove('active');
            dashboardView.classList.add('hidden');
            searchView.classList.remove('hidden');
            searchView.classList.add('active');
            input.value = '';
            input.focus();
        });
    }

    if (backFromCompareBtn) {
        backFromCompareBtn.addEventListener('click', () => {
            compareView.classList.remove('active');
            compareView.classList.add('hidden');
            searchView.classList.remove('hidden');
            searchView.classList.add('active');
        });
    }

    // Copy Tag Logic
    if (copyTagBtn) {
        copyTagBtn.addEventListener('click', () => {
            const tagText = resTag.textContent;
            navigator.clipboard.writeText(tagText).then(() => {
                const originalText = copyTagBtn.innerHTML;
                copyTagBtn.innerHTML = '✅ Copied!';
                setTimeout(() => { copyTagBtn.innerHTML = originalText; }, 2000);
            });
        });
    }

    // Search function
    async function performSearch(e, forcedTag = null) {
        if (e) e.preventDefault();
        
        let rawInput = forcedTag || input.value;
        if (errorMsg) errorMsg.classList.add('hidden');
        
        if (!rawInput || !rawInput.trim()) {
            if (errorMsg) {
                errorMsg.textContent = "Please enter a player tag";
                errorMsg.classList.remove('hidden');
            }
            return;
        }

        // Clean user input
        let tag = rawInput.replace(/\s+/g, '').replace(/#/g, '').toUpperCase();
        
        if (loading) loading.classList.remove('hidden');

        try {
            // Encode the tag in case there are any special characters left
            const response = await fetch(`/api/player/${encodeURIComponent(tag)}`);
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server error: Received HTML instead of JSON. Ensure your Node.js backend is running.");
            }

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Player not found. Make sure you entered your player tag, not your username.");
                }
                throw new Error(data.error || 'Failed to fetch player data');
            }

            currentPlayerStats = data;
            saveRecentSearch(tag);
            loadRecentSearches();

            populateDashboard(data);

            // Switch to Dashboard View
            if (loading) loading.classList.add('hidden');
            if (searchView) {
                searchView.classList.remove('active');
                searchView.classList.add('hidden');
            }
            if (dashboardView) {
                dashboardView.classList.remove('hidden');
                dashboardView.classList.add('active');
            }

        } catch (error) {
            if (loading) loading.classList.add('hidden');
            if (errorMsg) {
                errorMsg.textContent = error.message;
                errorMsg.classList.remove('hidden');
            }
        }
    }

    // Attach search logic robustly
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            performSearch(event);
        });
    }
    
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function(event) {
            if (searchBtn.type === 'button') {
                event.preventDefault();
                performSearch(event);
            }
        });
    }

    // --- New Feature Functions ---

    function saveRecentSearch(tag) {
        let recents = JSON.parse(localStorage.getItem('bs_recent_tags') || '[]');
        tag = '#' + tag;
        recents = recents.filter(t => t !== tag);
        recents.unshift(tag);
        if (recents.length > 3) recents.pop();
        localStorage.setItem('bs_recent_tags', JSON.stringify(recents));
    }

    function loadRecentSearches() {
        if (!recentContainer || !recentTagsDiv) return;
        let recents = JSON.parse(localStorage.getItem('bs_recent_tags') || '[]');
        if (recents.length > 0) {
            recentContainer.classList.remove('hidden');
            recentTagsDiv.innerHTML = '';
            recents.forEach(tag => {
                let span = document.createElement('span');
                span.className = 'recent-tag';
                span.textContent = tag;
                span.onclick = () => {
                    input.value = tag;
                    performSearch(null, tag);
                };
                recentTagsDiv.appendChild(span);
            });
        }
    }

    if (compareBtn) {
        compareBtn.addEventListener('click', async () => {
            let t1 = compTag1.value.replace(/\\s+/g, '').replace(/#/g, '').toUpperCase();
            let t2 = compTag2.value.replace(/\\s+/g, '').replace(/#/g, '').toUpperCase();
            
            if (!t1 || !t2) return alert("Please enter both tags to compare.");

            searchView.classList.remove('active');
            searchView.classList.add('hidden');
            compareView.classList.remove('hidden');
            compareView.classList.add('active');
            
            compareLoading.classList.remove('hidden');
            compareError.classList.add('hidden');
            compareResults.classList.add('hidden');

            try {
                const [res1, res2] = await Promise.all([
                    fetch(\`/api/player/\${encodeURIComponent(t1)}\`),
                    fetch(\`/api/player/\${encodeURIComponent(t2)}\`)
                ]);
                
                if (!res1.ok || !res2.ok) throw new Error("Could not find one or both players. Check the tags.");

                const data1 = await res1.json();
                const data2 = await res2.json();

                populateCompareColumn('cp1', data1);
                populateCompareColumn('cp2', data2);

                compareLoading.classList.add('hidden');
                compareResults.classList.remove('hidden');

            } catch (err) {
                compareLoading.classList.add('hidden');
                compareError.textContent = err.message;
                compareError.classList.remove('hidden');
            }
        });
    }

    function populateCompareColumn(prefix, data) {
        document.getElementById(\`\${prefix}-name\`).textContent = data.name || 'Unknown';
        document.getElementById(\`\${prefix}-tag\`).textContent = data.tag || '';
        document.getElementById(\`\${prefix}-trophies\`).textContent = formatNum(data.trophies || 0);
        document.getElementById(\`\${prefix}-3v3\`).textContent = formatNum(data['3vs3Victories'] || 0);
        
        let best = "None";
        if (data.brawlers && data.brawlers.length > 0) {
            let top = [...data.brawlers].sort((a,b) => (b.trophies || 0) - (a.trophies || 0))[0];
            best = \`\${top.name} (\${top.trophies}🏆)\`;
        }
        document.getElementById(\`\${prefix}-best\`).textContent = best;
    }

    if (snapshotBtn) {
        snapshotBtn.addEventListener('click', () => {
            if (!currentPlayerStats) return;
            
            const canvas = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Text Styles
            ctx.fillStyle = '#3b82f6';
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText(currentPlayerStats.name, 40, 80);
            
            ctx.fillStyle = '#94a3b8';
            ctx.font = '24px monospace';
            ctx.fillText(currentPlayerStats.tag, 40, 120);

            // Stats
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText(\`Trophies: \${formatNum(currentPlayerStats.trophies || 0)}\`, 40, 200);
            ctx.fillText(\`Highest: \${formatNum(currentPlayerStats.highestTrophies || 0)}\`, 40, 250);
            ctx.fillText(\`3v3 Wins: \${formatNum(currentPlayerStats['3vs3Victories'] || 0)}\`, 40, 300);

            if (currentPlayerStats.brawlers && currentPlayerStats.brawlers.length > 0) {
                let best = [...currentPlayerStats.brawlers].sort((a,b) => (b.trophies || 0) - (a.trophies || 0))[0];
                ctx.fillStyle = '#f59e0b';
                ctx.fillText(\`Best Brawler: \${best.name} (\${best.trophies}🏆)\`, 40, 350);
            }

            const link = document.createElement('a');
            link.download = \`BS_Snapshot_\${currentPlayerStats.name}.png\`;
            link.href = canvas.toDataURL();
            link.click();
        });
    }

    function generateRecommendations(brawlers) {
        if (!recommendationsContainer || !brawlers || brawlers.length === 0) return;
        
        recommendationsContainer.innerHTML = '';
        
        // Strategy 1: "Easy to Use" - High rarity/strong brawlers but low trophies
        let easyTargets = ['SHELLY', 'COLT', 'NITA', 'POCO', 'ROSA'];
        let easyPick = brawlers.find(b => easyTargets.includes(b.name) && b.trophies < 500);
        
        // Strategy 2: "Strong in Meta" - Find an S-Tier or A-Tier they have but haven't pushed
        let metaTargets = ['CORDELIUS', 'MELODIE', 'ANGELO', 'SPIKE', 'PIPER'];
        let metaPick = brawlers.find(b => metaTargets.includes(b.name) && b.trophies < 750 && b !== easyPick);

        // Strategy 3: "Good for Solo" - Assassins
        let soloTargets = ['LEON', 'EDGAR', 'CROW', 'MORTIS', 'SURGE'];
        let soloPick = brawlers.find(b => soloTargets.includes(b.name) && b.trophies < 800 && b !== easyPick && b !== metaPick);
        
        // Fallbacks if logic finds nothing
        let sorted = [...brawlers].sort((a,b) => (a.trophies||0) - (b.trophies||0));
        if (!easyPick) easyPick = sorted[0]; // Lowest trophy
        if (!metaPick) metaPick = sorted[1] || sorted[0];
        if (!soloPick) soloPick = sorted[2] || sorted[0];

        const recs = [
            { b: easyPick, label: 'Easy to Push', class: 'rec-easy' },
            { b: metaPick, label: 'Strong in Meta', class: 'rec-meta' },
            { b: soloPick, label: 'Good for Solo Queue', class: 'rec-solo' }
        ];

        recs.forEach(r => {
            if (!r.b) return;
            const card = document.createElement('div');
            card.className = 'brawler-card';
            card.innerHTML = \`
                <div class="brawler-img-wrapper">
                    <img src="https://cdn.brawlify.com/brawlers/borderless/\${r.b.id}.png" class="brawler-img" alt="\${r.b.name}" onerror="this.outerHTML='<div class=\\'brawler-icon\\'>👤</div>'">
                </div>
                <div class="brawler-info">
                    <div class="brawler-name">\${r.b.name} <span style="color:var(--text-muted); font-size:12px;">(\${r.b.trophies}🏆)</span></div>
                    <span class="rec-label \${r.class}">\${r.label}</span>
                </div>
            \`;
            recommendationsContainer.appendChild(card);
        });
    }

    function populateDashboard(data) {
        // Basic Identity
        if (resName) resName.textContent = data.name || 'Unknown';
        if (resTag) resTag.textContent = data.tag || '';
        if (headTrophies) headTrophies.textContent = formatNum(data.trophies || 0);
        if (headHighest) headHighest.textContent = formatNum(data.highestTrophies || 0);

        // Icon
        if (playerIcon && data.icon && data.icon.id) {
            playerIcon.src = `https://cdn.brawlify.com/profile/${data.icon.id}.png`;
        }

        // Overview Stats
        if (resClub) {
            if (data.club && data.club.name) {
                resClub.textContent = data.club.name;
                resClub.style.color = ""; // reset color
            } else {
                resClub.textContent = "No Club";
                resClub.style.color = "var(--text-muted)";
            }
        }
        
        if (resLevel) resLevel.textContent = formatNum(data.expLevel || 0);
        if (res3v3) res3v3.textContent = formatNum(data['3vs3Victories'] || 0);
        if (resSolo) resSolo.textContent = formatNum(data.soloVictories || 0);
        if (resDuo) resDuo.textContent = formatNum(data.duoVictories || 0);

        // Brawlers Analysis
        let brawlers = data.brawlers || [];
        
        // Progress
        const unlockedCount = brawlers.length;
        const progressPct = Math.min(100, Math.round((unlockedCount / TOTAL_BRAWLERS) * 100));
        
        if (collectionCount) collectionCount.textContent = unlockedCount;
        if (collectionPercent) collectionPercent.textContent = `${progressPct}%`;
        
        if (collectionFill) {
            // Delay width for animation effect
            setTimeout(() => {
                collectionFill.style.width = `${progressPct}%`;
            }, 100);
        }

        // Breakdowns
        let c1000 = 0, c750 = 0, c500 = 0, c300 = 0;
        brawlers.forEach(b => {
            if (b.trophies >= 1000) c1000++;
            if (b.trophies >= 750) c750++;
            if (b.trophies >= 500) c500++;
            if (b.trophies >= 300) c300++;
        });

        if (bd1000) bd1000.textContent = c1000;
        if (bd750) bd750.textContent = c750;
        if (bd500) bd500.textContent = c500;
        if (bd300) bd300.textContent = c300;

        // Top 3 Brawlers
        if (topBrawlersContainer) {
            topBrawlersContainer.innerHTML = '';
            if (brawlers.length > 0) {
                const sortedBrawlers = [...brawlers].sort((a, b) => (b.trophies || 0) - (a.trophies || 0)).slice(0, 3);
                
                sortedBrawlers.forEach(b => {
                    const card = document.createElement('div');
                    card.className = 'brawler-card';
                    const imgUrl = `https://cdn.brawlify.com/brawlers/borderless/${b.id}.png`;
                    card.innerHTML = `
                        <div class="brawler-img-wrapper">
                            <img src="${imgUrl}" class="brawler-img" alt="${b.name}" onerror="this.outerHTML='<div class=\\'brawler-icon\\'>👤</div>'">
                        </div>
                        <div class="brawler-info">
                            <div class="brawler-name">${b.name}</div>
                            <div class="brawler-stats">
                                <span>🏆 <strong>${formatNum(b.trophies || 0)}</strong></span>
                                <span>⚡ <strong>${b.power || '?'}</strong></span>
                            </div>
                        </div>
                    `;
                    topBrawlersContainer.appendChild(card);
                });
            } else {
                topBrawlersContainer.innerHTML = '<p class="muted-text">No brawlers found.</p>';
            }
        }

        // About Paragraph
        if (aboutText) {
            aboutText.innerHTML = `<strong>${data.name || 'This player'}</strong> has a total of <strong style="color:var(--trophy)">${formatNum(data.trophies || 0)}</strong> trophies with a peak of <strong>${formatNum(data.highestTrophies || 0)}</strong>. They have unlocked <strong>${unlockedCount}</strong> out of ${TOTAL_BRAWLERS} brawlers in the game. Their battle experience includes <strong>${formatNum(data['3vs3Victories'] || 0)}</strong> 3v3 victories, <strong>${formatNum(data.soloVictories || 0)}</strong> solo victories, and <strong>${formatNum(data.duoVictories || 0)}</strong> duo victories.`;
        }

        generateRecommendations(brawlers);
    }
}
