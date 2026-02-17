// taxa/constants/taxa.js

// Automatically import all .js files in the 'taxa' subfolder
const modules = import.meta.glob('./taxa/*.js', { eager: true });

// Extract default exports into an array
const taxaArray = Object.values(modules).map(m => m.default);

export default taxaArray;
