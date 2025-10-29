const fs = require('fs');
const path = require('path');

// Function to copy files recursively
function copyFilesRecursively(source, target, filter) {
	if (!fs.existsSync(target)) {
		fs.mkdirSync(target, { recursive: true });
	}

	const files = fs.readdirSync(source);

	files.forEach(file => {
		const sourcePath = path.join(source, file);
		const targetPath = path.join(target, file);
		const stat = fs.statSync(sourcePath);

		if (stat.isDirectory()) {
			copyFilesRecursively(sourcePath, targetPath, filter);
		} else if (filter(sourcePath)) {
			fs.copyFileSync(sourcePath, targetPath);
			console.log(`Copied: ${sourcePath} -> ${targetPath}`);
		}
	});
}

// Copy SVG and PNG files from nodes to dist/nodes
const nodesSource = path.join(__dirname, '..', 'nodes');
const nodesTarget = path.join(__dirname, '..', 'dist', 'nodes');

copyFilesRecursively(nodesSource, nodesTarget, (src) => {
	return src.endsWith('.svg') || src.endsWith('.png');
});

console.log('✓ Icons copied successfully!');

