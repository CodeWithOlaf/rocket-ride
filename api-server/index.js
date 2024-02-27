const express = require('express')
const {generateSlug} = require('random-word-slugs')
const {ECSClient, RunTaskCommand} = require("@aws-sdk/client-ecs")
const { Server } = require("socket.io")
const { Redis } = require(  'ioredis')

const app = express()
const PORT = 9000
const subscriber = new Redis(process.env.REDIS_URL)
const io = new Server({cors : "*"})

io.on("connection", socket =>{
    socket.on('subscribe', channel => {
        socket.join(channel)
        socket.emit("message", `Joined ${channel}`)
    })
})

io.listen(9001, ()=> console.log("Socket is on"))

const ecsClient = new ECSClient({
    region : 'ap-south-1',
    credentials : {
        accessKeyId : process.env.ACCESS_KEY,
        secretAccessKey : process.env.SECRET_ACCESS_KEY
    }
})

const config = {
    CLUSTER : process.env.CLUSTER,
    TASK : process.env.TASK
}

app.use(express.json())

app.post("/project", async (req, res)=>{
    const {gitURL} = req.body;
    const projectSlug = generateSlug()
    // Spin Container here
    const command = new RunTaskCommand({
        cluster : config.CLUSTER,
        taskDefinition : config.TASK,
        launchType : 'FARGATE',
        count : 1,
        networkConfiguration : {
            awsvpcConfiguration :{
                assignPublicIp : 'ENABLED',
                subnets : ['subnet-05f7c4937657f535c', 'subnet-06f689d439cdd1720', 'subnet-091c204d362b24264'],
                securityGroups: [process.env.SECURITY_GROUP],
            }
        },
        overrides : {
            containerOverrides: [
                {
                    name : "build-server",
                    environment : [
                        {
                            name : "GIT_REPOSITORY__URL",
                            value : gitURL
                        },
                        {
                            name : "PROJECT_ID",
                            value : projectSlug
                        },
                        {
                            name : "REDIS_URL",
                            value : process.env.REDIS_URL
                        }
                    ]
                }
            ]
        }
    })
    await ecsClient.send(command)
    return res.json( {
        status : "queued",
        data : {projectSlug, url : `https://${projectSlug}.localhost:8000`}
    })
})

async function initRedisSubscribe (){
    console.log("Subscribed to Logs")
    subscriber.psubscribe('logs:*')
    subscriber.on("pmessage", (pattern, channel, message)=>{
        io.to(channel).emit('message', message)
    })
}

initRedisSubscribe()

app.listen(PORT, ()=> console.log("api-server started !"))