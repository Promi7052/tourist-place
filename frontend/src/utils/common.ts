

export const toTitleCase = (str: string) => {
    if (!str) return '';

    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};


export const firstCharCap = (str:string) => {
    if (!str) return ''; // Return empty string if input is null or empty

    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const allCap = (str:string) => {
    if (!str) return ''; // Return empty string if input is null or empty

    return str.toUpperCase();
};