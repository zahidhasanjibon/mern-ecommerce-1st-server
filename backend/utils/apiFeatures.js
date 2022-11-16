class APiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword
            ? {
                  name: { $regex: this.queryStr.keyword, $options: 'i' },
              }
            : {};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        const queryStrCopy = { ...this.queryStr };
        const removeFileds = ['keyword', 'page', 'limit'];
        removeFileds.forEach((key) => {
            delete queryStrCopy[key];
        });

        let queryStr = JSON.stringify(queryStrCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        this.query = this.query.find(JSON.parse(queryStr));

        // this.query = this.query.find({name: { $regex: "lapt", $options: "i" }, price: { $gte: "200", $lt: "6000" }});
        // this.query = this.query.find({ price: { $gte: 700, $lt: 1000 } });
        // this.query = this.query.find({category: "shirt",price: { $gte: 200, $lt: 6000 },}); // find multiple  parameter query
        return this;
    }

    pagination(resultPerPage) {
        const currentPage = this.queryStr.page || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}
module.exports = APiFeatures;
