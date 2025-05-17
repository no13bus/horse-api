# Backend Development Quiz

## REST API Best Practices

### 1. What is the most appropriate HTTP status code to return when a resource is successfully created?

- [ ] 200
- [x] 201
- [ ] 202
- [ ] 204

### 2. Which of these HTTP methods is not typically idempotent?

- [ ] GET
- [x] POST
- [ ] PUT
- [ ] DELETE

### 3. Which HTTP status code best represents a successful DELETE operation with no content to return?

- [ ] 200
- [x] 204
- [ ] 400
- [ ] 404

### 4. Which practice is NOT recommended in REST API design?

- [ ] Use plural nouns for resources
- [ ] Include version numbers in the URL
- [x] Use GET for all operations
- [ ] Return detailed error messages

### 5. Which approach is best for adding filtering in a REST API without overloading the server?

- [x] Use query parameters for filters
- [ ] Load all data on the client side and filter
- [ ] Implement full-text search on every field
- [ ] Separate endpoints for each filter

### 6. In designing a REST API, which of these is a recommended practice for error handling?

- [ ] Return status code 500 for all errors
- [x] Use descriptive error codes and messages
- [ ] Only return generic error messages to the client
- [ ] Avoid returning error codes, only messages

### 7. What is the primary purpose of pagination in API design?

- [ ] To simplify frontend development
- [ ] To handle filtering of resources
- [x] To manage large datasets and reduce server load
- [ ] To improve data integrity

### 8. Which approach would best ensure that a REST API remains responsive under heavy load?

- [ ] Increase database connection pool size
- [x] Implement rate limiting to control incoming requests
- [ ] Shift all endpoints to synchronous processing
- [ ] Remove pagination to reduce server processing time

## Role-Based Access Control (RBAC)

### 9. Which of the following best describes the "least privilege" principle in RBAC?

- [ ] Allowing users to access all resources
- [x] Granting users access only to resources necessary for their role
- [ ] Allowing only administrators to access all resources
- [ ] Restricting all users to read-only access

### 10. What is a practical approach to enforcing role-based access control in a REST API?

- [ ] Embed role information in each payload
- [ ] Check roles in each endpoint individually
- [x] Centralize role checks with middleware
- [ ] Store roles in environment variables

### 11. In designing RBAC for a REST API, which approach is generally more scalable and maintainable?

- [ ] Implement role checks directly within each route handler
- [x] Define access control policies in a central middleware or authorization service
- [ ] Use a separate role for every unique endpoint combination
- [ ] Allow each endpoint to specify its own roles and permissions without central oversight

## Google Cloud Platform (GCP)

### 12. Which GCP service is best suited for hosting containerized applications?

- [ ] Firebase
- [ ] Firestore
- [ ] Cloud Functions
- [x] Google Kubernetes Engine (GKE)

### 13. What is a primary advantage of using Google Cloud Run for a serverless deployment?

- [ ] Persistent data storage
- [x] Automatically scales based on request load
- [ ] Fixed pricing model regardless of usage
- [ ] No requirement for containerization

### 14. Which Google Cloud service is best for handling asynchronous messaging between services?

- [x] Cloud Pub/Sub
- [ ] Firestore
- [ ] GKE
- [ ] Cloud Run

### 15. What is Firestore's main advantage as a database choice?

- [ ] Enforces strict schema
- [x] Real-time sync and scalability
- [ ] Native support for complex joins
- [ ] Built-in role-based access

## Database Design

### 16. In a document-based NoSQL database like Firestore, how would you best store a list of related items?

- [x] Use a sub-collection within each horse document
- [ ] Store the list in a relational database instead
- [ ] Store each item in a separate collection at the root level
- [ ] Store the list as a string field

### 17. Which of these is a drawback of using NoSQL databases for storing highly relational data?

- [ ] Limited scalability
- [x] Inefficiency in handling complex joins
- [ ] High storage costs
- [ ] Inflexible schema structure 