
# Rocket Ride
Rocket Ride is a platform that allows users to  deploy and host web applications. It provides a  process for users to submit their GitHub repositories and quickly deploy them as hosted web pages.

## Architecture Overview
1. API Server
* Receives GitHub repository links from end users.
* Initiates the build process by cloning the project into a Docker container hosted on Amazon ECS.
2. Build Server
* Docker container where the user's project is cloned and built.
* Pulls image from Amazon ECR
* Runs on Amazon ECS, providing scalability and reliability.
3. Amazon ECR
* Stores image for running the docker container.
5. Azure Blob Storage
* Stores the output files generated from the build process.
6. Reverse Proxy
* Routes incoming requests to the appropriate file hosted on azure blob storage.
7. Log Managment
* Logs generated during the build process are managed using a pub-sub architecture with Redis.
* Logs are published by the build server and subscribed to by the API server using Redis and Socket.IO, enabling real-time log streaming to users.

![Alt text](relative%20Rocket-Ride.jpg.jpg?raw=true "Rocket-Ride")



## Getting Started
1. Clone the git repository.
2. Setup the AWS and Azure Services as they are closed due to Cost Managment.
2. Configure the API server to interact with these services.
3. Update the necessary configurations and environment variables.
4. Begin accepting GitHub repository submissions from users and deploy their projects as hosted web pages.


## Contributing
We welcome contributions from the community! If you have ideas for improvements or would like to report any issues, please open an issue or submit a pull request on GitHub.

