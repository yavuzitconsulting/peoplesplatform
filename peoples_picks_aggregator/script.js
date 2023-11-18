document.addEventListener('DOMContentLoaded', function () {
    const tbody = document.querySelector('#dataTable tbody');
    let data = [];
    let sortByTrend = false;
    let currentPage = getCurrentPageFromUrl();
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
                    </span>
                </td>
                <td class="title">
                    <span><a href="${item.url}" target="_blank">
                    ${item.title}</a></span>
                    <span class="shorturl" onclick="filterTableByHost('${item.host}')">(${item.host})</span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    function fetchDataWithFilter(filterKeyword) {
        fetch(`http://localhost:3000/aggregate?filter=${filterKeyword}`)
            .then((response) => response.json())
            .then((result) => {
                data = result;
                updateTable();
            })
            .catch((error) => console.error('Error fetching data:', error));
    }

    function getCurrentPageFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return parseInt(urlParams.get('p')) || 1;
    }

    function updateUrl() {
        window.history.replaceState({}, document.title, `?p=${currentPage}`);
    }

    window.filterTableByHost = function (host) {
        fetchDataWithFilter(host);
    };

    window.clearFilter = function () {
        fetchDataWithFilter('');
    };

    window.toggleSort = function () {
        sortByTrend = !sortByTrend;
        updateTable();
    };

    fetchDataWithFilter('');

});
