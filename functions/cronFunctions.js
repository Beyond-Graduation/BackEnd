const axios = require('axios');
require("dotenv").config(); // load .env variables
const { BACKEND_HOST_LINK } = process.env;
const triggerCloseRoute = async() => {
    try {
        const { Internship } = require("../models/Internship");

        const internships = await Internship.find({
            status: "open",
            deadline: {
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999),
            },
        }).lean();

        console.log("Internships found to be expired on ", Date.now(), internships);

        for (const internship of internships) {
            await axios.post(BACKEND_HOST_LINK + '/internship/close', {
                internshipId: internship.internshipId,
            });
        }
    } catch (error) {
        console.error('Error triggering close route:', error);
    }
};

module.exports = { triggerCloseRoute };