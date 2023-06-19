const axios = require('axios');
require("dotenv").config(); // load .env variables
const { BACKEND_HOST_LINK } = process.env;
const Internship = require("../models/Internship");
const triggerCloseRoute = async() => {
    try {
        const internships = await Internship.find({
            status: "open",
            deadline: {
                $lte: new Date()
            },
        }).select('internshipId alumniId role companyName deadline dateUploaded');

        console.log("Internships found to be expired on ", Date.now().toISOString(), internships);

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