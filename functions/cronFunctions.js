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
        const internshipIds = internships.map(internship => internship.internshipId);
        await Internship.updateMany({ internshipId: { $in: internshipIds } }, // filter criteria using $in operator
            { $set: { status: "closed" } } // update operation
        );
    } catch (error) {
        console.error('Error triggering close route:', error);
    }
};

module.exports = { triggerCloseRoute };