# WCN File Upload System
This is the source repository for the WCN File Upload System.

This system is intended as remote file storage for WCN's users, ranging from images to text documents to compressed archives.

This program is not intended to run on any server excluding WCN. If you wish to install this program on your own system, clone this repository and figure it out. Knowledge of node.js greatly helps.

### Default Configuration
Create a `CONFIG.json` file in `src/` with the following properties.

	{
		"port": 80
	}