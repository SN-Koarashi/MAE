"use strict";
const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

const Extract_File = fs.readFileSync(path.join(__dirname,"Extract.txt")).toString();

if(!Extract_File){
	console.warn("[WARN] Extract Content does not exist. Please check file: Extract.txt");
	process.exit(0);
	return;
}

const main_indexes = path.join(process.env.APPDATA, ".minecraft/assets/indexes", `${Extract_File}.json`);
const output_dir = path.join(__dirname, "output");

// Set routes
app.get('/', (req, res) => {
  res.send('= Express Web App =');
});

// start and listen on the Express server
app.listen(port, async () => {
	try{
		var indexes = fs.readFileSync(main_indexes).toString();
	}
	catch(e){
		if(e.code == "ENOENT")
			console.warn(`[WARN] Could not find the json file: ${Extract_File} at path: ${e.path}`);
		else
			console.warn(`[WARN] Other error code: ${e.code}`);
		process.exit(0);
		return;
	}
	
	var list = JSON.parse(indexes).objects;
	var total = Object.getOwnPropertyNames(list).length;
	var now = 0;
	for(let l in list){
		now++;
		let full_dir = l;
		
		let dir_arr = l.split('/');
		let dir_len = dir_arr.length;
		
		let filename = "";
		let dir = "";
		let index = 0;
		
		for(let fd of dir_arr){
			if(index != dir_len-1)
				dir = path.join(dir,fd);
			else
				filename = fd;
			index++;
		}
		let now_dir = path.join(output_dir,dir);
		fs.mkdirSync(now_dir, { recursive: true });
		
		
		let hash = list[l].hash;
		let hash_prefix = list[l].hash.substring(0,2);
		let now_file = path.join(process.env.APPDATA,'.minecraft/assets/objects',hash_prefix,hash);
		
		let buffer = fs.readFileSync(now_file);
		fs.writeFileSync(path.join(now_dir,filename),buffer);
		
		let percent = Math.floor(now/total*10000)/100;
		console.log("[INFO] Extract:",path.join(hash_prefix,hash),`${now}/${total}`,`(${percent}%)`);
	}
	
	console.log("[INFO] File Extracting was all completed.");
	process.exit(0);
});