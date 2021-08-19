import app from './loaders/application';

const port = 3500;

app.listen(port, () => {
    console.log(`App is listening on port ${port}!`);
});
