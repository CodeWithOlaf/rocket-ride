const { exec } = require("child_process")
const path = require("path")
const fs = require("fs")
const mime = require("mime-types")
const azure = require('azure-storage')
const Redis = require("ioredis")
require('dotenv').config()

const publisher = new Redis(process.env.REDIS_URL)

function publishLog(log) {
    publisher.publish(`logs L ${r}`, JSON.stringify({log}))
}

const r =  process.env.PROJECT_ID


const blobSvc = azure.createBlobService();

blobSvc.createContainerIfNotExists('rocket-ride-container', {publicAccessLevel : 'blob'}, function(error, result, response) {
    blobSvc.createContainerIfNotExists('rocket-ride-container', {publicAccessLevel : 'blob'}, function(error, result, response) {
        if (error) {
            console.error("Error creating container:", error);
            publishLog(error)
        } else {
            console.log("Container created successfully");
            publishLog("Container created successfully");
            // Call init after container creation is complete
            init();
        }
    });    
})

async function uploadFileToBlob(filePath, projectId) {
    
    return new Promise((resolve, reject) => {
        const blobName = `__outputs/${projectId}/${path.basename(filePath)}`;
        console.log(blobName)
        publishLog(blobName)
        blobSvc.createBlockBlobFromLocalFile('rocket-ride-container', blobName, filePath, { contentType: mime.lookup(filePath) }, function(error, result, response) {
            if (error) {
                reject(error);
            } else {
                console.log(`File "${filePath}" uploaded as blob "${blobName}"`);
                publishLog(`File "${filePath}" uploaded as blob "${blobName}"`);
                resolve();
            }
        });
    });
}


async function init(){
    console.log('Executing script.js')
    publishLog('Build Started...')
    const outDirPath = path.join(__dirname, 'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', function (data) {
        console.log(data.toString())
        publishLog(data.toString())
    })

    p.stdout.on('error', function (data) {
        console.log('Error', data.toString())
        publishLog(`error: ${data.toString()}`)
    })


    p.on('close', async function(data){
        console.log("Build Complete")
        publishLog("Build Complete")
        const distFolderPath = path.join(__dirname, 'output', 'dist')
        const distFolderContents = fs.readdirSync(distFolderPath, {recursive : true})
        
        publishLog(`Starting to upload`)
        for (const file of distFolderContents) {
            const filePath = path.join(distFolderPath, file);
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log("Uploading File:", filePath);
            publishLog("Uploading File:", file)
            try {
                await uploadFileToBlob(filePath, process.env.PROJECT_ID);
            } catch (error) {
                console.error("Error uploading file:", error);
                publishLog("Error uploading file:", error)
            }
        }
        
        console.log("Done ...")
        publishLog("Done ....")
    })
}

