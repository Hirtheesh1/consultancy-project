try {
    console.log('Loading models...');
    const models = require('./models');
    console.log('Models loaded.');

    console.log('Loading productController...');
    const pc = require('./controllers/productController');
    console.log('ProductController loaded.');
} catch (error) {
    console.error('DEBUG ERROR:', error);
}
