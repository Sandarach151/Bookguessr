
function sortBy(field) {
    return function(a, b) {
        return (a[field] < b[field]) - (a[field] > b[field])
    };
}

exports.sortBy = sortBy;