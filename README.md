# restaurant reservation

This is a simple restaurant reservation API. that runs on Docker
to use you can semply run:
```
dockor-compose up
```
> if you are trying to run docker on windows you may face a error that says it is failing to build; it is a windows path problem that requires you to build the api app first then use its image for the docker-compose.
> try running: 
> ` docker build -f ./DockerFile --tag restaurant-api-docker . `
> then in file `docker-compose.yml` uncomment the `image: 'restaurant-api-docker'`
> and comment the `build: .`
> then run `dockor-compose up` and it will work perfectly


## Notes
- api runs on port `3000`
- Database is configured with one user on start, to login use:
    ```
    emp_num: '0001'
    password: '123456'
    ```
- Database is congugered with one table also with number 1
    ```
    table_number = 1
    ```
    so you can start using the API to add reservation with no need for any actions.
- folder `docs` contains the flow chart of the reservation problem, and the postman documantation.

## License

MIT
