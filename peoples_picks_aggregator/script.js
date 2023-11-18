document.addEventListener('DOMContentLoaded', function () {
    const tbody = document.querySelector('#dataTable tbody');
    let data = [];
    let sortByTrend = false;
    let currentPage = getCurrentPageFromUrl();
    let activeChain = getActiveChainFromUrl();
    const itemsPerPage = 30;


    function updateTable() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const urlVotesArray = data;

        urlVotesArray.sort((a, b) => {
            if (sortByTrend) {
                return b.trend - a.trend;
            } else {
                return b.totalVotes - a.totalVotes;
            }
        });

        tbody.innerHTML = '';

        urlVotesArray.forEach((item, index) => {
            const placement = startIndex + index + 1;

            const row = document.createElement('tr');
            row.className = 'top-row';
            row.setAttribute('associated-id', startIndex + index);
            let voteClass = item.totalVotes > 0 ? 'up' : 'down';
            if (item.totalVotes === 0) {
                voteClass = 'equal';
            }
            row.innerHTML = `
                <td class="placement">${placement}.</td>
                <td>
                    <span class="vote-icon ${voteClass}">
                        ${item.totalVotes > 0 ? '⮝' : ''}
                        ${item.totalVotes < 0 ? '⮟' : ''}
                        ${item.totalVotes === 0 ? '⮞' : ''}
                    </span>
                </td>
                <td class="title">
                    <span><a href="${item.url}" target="_blank">
                    ${item.title}</a></span>
                    <span class="shorturl" onclick="filterTableByHost('${item.host}')">(${item.host})</span>
                </td>
            `;
            tbody.appendChild(row);

            const subtextRow = document.createElement('tr');
            subtextRow.className = 'subtext-row';
            subtextRow.setAttribute('associated-id', startIndex + index);
            subtextRow.innerHTML = `
                <td class="empty" colspan="2"></td>
                <td class="subtext" colspan="2">Votes: ⮝ ${item.upvotes} | ⮟ ${item.downvotes}</td>
            `;
            tbody.appendChild(subtextRow);
        });

    }

    function fetchDataWithFilterAndChain(filterKeyword, chain) {
        const apiUrl = filterKeyword ?
            `https://www.caleidoscode.io/api/aggregate?filter=${filterKeyword}&chain=${chain}&p=${currentPage}` :
            `https://www.caleidoscode.io/api/aggregate?chain=${chain}&p=${currentPage}`;
    
        fetch(apiUrl)
            .then(response => response.json())
            .then(newData => {
                data = newData;
                updateTable();
                updateUrl();
            })
            .catch(error => console.error('Error fetching data from API:', error));
    }    

    function getCurrentPageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('p')) || 1;
    }

    function getActiveChainFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('chain') || '501984';
    }

    function updateUrl() {
        window.history.replaceState({}, document.title, `?chain=${activeChain}&p=${currentPage}`);
    }

    window.filterTableByHost = function (host) {
        fetchDataWithFilterAndChain(host, activeChain);
    };

    window.clearFilter = function () {
        fetchDataWithFilterAndChain(null, activeChain);
    };

    window.toggleSort = function () {
        sortByTrend = !sortByTrend;
        updateTable();
    };

    window.goToPrevPage = function () {
        if (currentPage > 1) {
            currentPage--;
            fetchDataWithFilterAndChain(null, activeChain);
        }
    };

    window.goToNextPage = function () {
        currentPage++;
        fetchDataWithFilterAndChain(null, activeChain);
    };

    // Initial fetch
    fetch(`https://www.caleidoscode.io/api/aggregate?chain=${activeChain}&p=${currentPage}`)
        .then(response => response.json())
        .then(newData => {
            data = newData;
            updateTable();
            updateUrl();
        })
        .catch(error => console.error('Error fetching data from API:', error));
});
