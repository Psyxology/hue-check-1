document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("walletForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const walletAddressInput = document.getElementById("walletAddress").value.trim().toLowerCase();
        const url = 'https://d2hfhz0c37x28y.cloudfront.net/prod/stats?details=true';

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const minerDetails = data.minerDetails;
                const matchedMiner = minerDetails.find(miner => miner.miner_id.toLowerCase() === walletAddressInput);
                if (matchedMiner) {
                    // Pass both the matched miner and the entire data object
                    displayData(matchedMiner, data);
                } else {
                    alert("No matching wallet address found.");
                }
            })
            
            .catch(error => {
                console.error('Error fetching data:', error);
                alert("Failed to fetch data.");
            });
    });
});

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

function displayData(minerData, fullData) {
    // Exclude specific fields from the miner data
    const displayMinerData = {
        "miner_id": minerData.miner_id,
        "hardware": minerData.hardware,
       
        "total_image_count": minerData.total_image_count,
        "total_text_count": minerData.total_text_count,
        "last_24_hours_image_count": minerData.last_24_hours_image_count,
        "last_24_hours_text_count": minerData.last_24_hours_text_count,
        "status": minerData.status
    };

    // Incorporate global stats
    const globalStats = {
        "last24HrsImageCount": fullData.last24HrsImageCount,
        "last24HrsTextCount": fullData.last24HrsTextCount,
    };

    const yourLast24HoursCount = parseInt(minerData.last_24_hours_image_count, 10) + parseInt(minerData.last_24_hours_text_count, 10);
    const globalLast24HoursCount = globalStats.last24HrsImageCount + globalStats.last24HrsTextCount;
    const yourMiningPowerRatio = yourLast24HoursCount / globalLast24HoursCount; // Keep as a decimal for calculations

    const fdvValues = [50000000, 100000000, 300000000, 500000000];
    const earningsStatements = fdvValues.map(fdv => {
        const yourEarnings = (yourMiningPowerRatio * (0.05 * fdv)).toFixed(2);
        return `If $HUE dropped today at a $${fdv.toLocaleString()} FDV, then you would receive the equivalent of $${yourEarnings}.`;
    }).join("\n\n");

    const popupContent = document.getElementById("popupContent");
    popupContent.innerHTML = `<h3>Your Stats:</h3><pre>${JSON.stringify(displayMinerData, null, 2)}</pre>` +
                             `<h3>Global Stats:</h3><pre>${JSON.stringify(globalStats, null, 2)}</pre>` +
                             `<h3>Speculation:</h3><p>Extrapolating from the 24Hr count, you represent ${(yourMiningPowerRatio * 100).toFixed(2)}% of the total Heurist testnet mining power!</p>` +
                             `<p>${earningsStatements.replace(/\n/g, '<br>')}</p>`+
                             `<p>Happy mining🥳!</p>`;
    document.getElementById("popup").style.display = "block";
}
