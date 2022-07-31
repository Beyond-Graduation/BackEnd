# Backend For Alumni Tracking Platfrom

## REST API Built using Express and MongoDB

#### Routes

- Alumni SignUp
  Request

  ```jsx
  [POST] localhost:4000/alumni/signup
  ```

  Body

  ```jsx
  {
      "userId":"1213yt",
      "email":"christin@gmail.com",
      "password": "!&*5g123@",
      "firstName":"Christin",
      "lastName":"Suni",
      "areasOfInterest":["Computer Vision","ML"],
      "department":"ECE",
      "yearGraduation":2000,
      "degree":"BTech",
      "workExperience":[{"from":2001,"to":2011,"company":"TC","role":"SDE-1"}]

  }
  ```

  Response

  ```jsx
  {
      "_id": "62dbd9ca3be2e10775087338",
      "areasOfInterest": [
          "Computer Vision",
          "ML"
      ],
      "address": null,
      "linkedin": null,
      "github": null,
      "otherLinks": null,
      "__t": "Alumni",
      "userId": "1213yt",
      "email": "christin@gmail.com",
      "password": "$2a$10$CEPXoWxz8jRIgOAwqJSN8uLPI6ojZflwVgk2ApWskECAI6mJN28u2",
      "firstName": "Christin",
      "lastName": "Suni",
      "department": "ECE",
      "yearGraduation":2000,
      "workExperience": [
          {
              "_id": "62dbd9ca3be2e10775087339",
              "from": 2001,
              "to": 2011,
              "company": "TC",
              "role": "SDE-1"
          }
      ],
      "higherStudies": [],
      "publications": [],
      "updated": "2022-07-23T11:21:46.243Z",
      "__v": 0
  }
  ```

- Alumni Login [Common for All]
  Request
  ```jsx
  [POST] localhost:4000/login
  ```
  Body
  ```jsx
  {
      "email":"christin@gmail.com",
      "password": "#%8123@"
  }
  ```
  Response
  ```jsx
  {
      "token": "#######################################################################"
  }
  ```
- Alumni Update [Profile] [Given that alumni are Logged in]
  Request

  ```jsx
  [POST] localhost:4000/alumni/update
  ```

  The header of Request [front-end must add encrypted Token for in the Authorization of Header in Request for verification.]
  ![Authentication](https://fine-babcat-b55.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Ff94bb1a8-e756-44ca-aab0-3393eb7e9faf%2FUntitled.png?table=block&id=7fface8b-8c28-4860-9e17-8832ee15e29b&spaceId=52f1fa23-469b-445d-b79f-d1271fe5b0a0&width=2000&userId=&cache=v2)
  Body

  ```jsx
  {
      "areasOfInterest":["NLP","Computer Vision","ML"],
      "higherStudies":[{"degree":"Mtech","university":"NIT","yearGraduation":2005},{"degree":"PhD","university":"IIT","yearGraduation":2012}]

  }
  ```

  Response

  ```jsx
  {
      "areasOfInterest": [
          "NLP",
          "Computer Vision",
          "ML"
      ],
      "address": null,
      "linkedin": null,
      "github": null,
      "otherLinks": null,
      "__t": "Alumni",
      "_id": "62dbd9ca3be2e10775087338",
      "userId": "1213yt",
      "email": "christin@gmail.com",
      "password": "$2*Y*H&*T*%^*%*TGGIUHOIHOIJIJOLJLLUIGUFYF#",
      "firstName": "Christin",
      "lastName": "Suni",
      "department": "ECE",
      "yearGraduation":2000,
      "workExperience": [
          {
              "_id": "62dbd9ca3be2e10775087339",
              "from": 2001,
              "to": 2011,
              "company": "TC",
              "role": "SDE-1"
          }
      ],
      "higherStudies": [
          {
              "_id": "62dbdbb23be2e1077508733f",
              "degree": "Mtech",
              "university": "NIT",
              "yearGraduation": 2005
          },
          {
              "_id": "62dbdbb23be2e10775087340",
              "degree": "PhD",
              "university": "IIT",
              "yearGraduation": 2012
          }
      ],
      "publications": [],
      "updated": "2022-07-23T11:29:54.985Z",
      "__v": 0
  }
  ```

- Alumni Blog Create
  Request

  ```jsx
  [POST] localhost:4000/blog/create
  ```

  Body

  ```jsx
  {
  		"blogId":"b62345",
      "title":"Computer Vision and Python",
      "domain":["computer vision","python"],
      "content":"Computer vision is a discipline that studies how to reconstruct, interrupt and understand a 3d scene from its 2d images, in terms of the properties of the structure present in the scene."

  }
  ```

  Response

  ```jsx
  {
      "domain": [
          "computer vision",
          "python"
      ],
      "_id": "62dbdd316627ba086f9f7be4",
      "title": "Computer Vision and Python",
      "content": "Computer vision is a discipline that studies how to reconstruct, interrupt and understand a 3d scene from its 2d images, in terms of the properties of the structure present in the scene.",
      "userId": "1213yt",
      "firstName": "Christin",
      "lastName": "Suni",
      "__v": 0
  }
  ```

- Student SignUp
  Request

  ```jsx
  [POST] localhost:4000/student/signup
  ```

  Body

  ```jsx
  {
      "userId":"144u62",
      "email":"souravsatheesh@cet.ac.in",
      "password": "$%BKJKLN23@",
      "firstName":"Sourav",
      "lastName": "Satheesh",
      "areasOfInterest":["Web Development","Backend"],
      "zip":682002,
      "linkedin":"https://www.linkedin.com/in/sourav/",
      "github":"https://github.com/sourav",
      "otherLinks":"https://sourav.co",
      "cgpa":9.99,
      "degree":"BTech",
      "higherSecondary":{"board":"CBSE","cgpa":95},
      "yearOfJoining":2021,
      "expectedGraduationYear":2025,
      "department":"ECE"

  }
  ```

  Response

  ```jsx
  {
      "areasOfInterest": [
          "Web Development",
          "Backend"
      ],
      "address": null,
      "linkedin": "https://www.linkedin.com/in/sourav/",
      "github": "https://github.com/sourav",
      "otherLinks": "https://sourav.co",
      "__t": "Student",
      "_id": "62dbde346627ba086f9f7be6",
      "userId": "144u62",
      "email": "souravsatheesh@cet.ac.in",
      "password": "$2*Y*H&*T*%^*%*TGGIUHOIHOIJIJOLJLLUIGUFYF#"",
      "firstName": "Sourav",
      "lastName": "Satheesh",
      "cgpa": 9.99,
      "degree": "BTech",
      "higherSecondary": {
          "_id": "62dbde346627ba086f9f7be7",
          "board": "CBSE",
          "cgpa": 95
      },
      "yearOfJoining": 2021,
      "expectedGraduationYear": 2025,
      "department": "ECE",
      "updated": "2022-07-23T12:10:45.999Z",
      "__v": 0
  }
  ```

## **Common for all [Logged In users]**

- Login
  Request
  ```jsx
  [POST] localhost:4000/login
  ```
  Body
  ```jsx
  {
      "email":"christin@gmail.com",
      "password": "test123@"
  }
  ```
  Response
  ```jsx
  {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjEzeXQiLCJ1c2VyVHlwZSI6IkFsdW1uaSIsImlhdCI6MTY1ODU4MzE0MX0.NiURslWn8AHeHcXQtY9ZojkDCQbKylqOOrw3j8xFyYg",
      "userId": "1213yt"
  }
  ```
  Instruction
  _Use Token in Header of Request for all logged in activities_

**For all logged in activities**, front-end must add encrypted Token for in the Authorization of Header in Request for verification.

![Authentication](https://fine-babcat-b55.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Ff94bb1a8-e756-44ca-aab0-3393eb7e9faf%2FUntitled.png?table=block&id=7fface8b-8c28-4860-9e17-8832ee15e29b&spaceId=52f1fa23-469b-445d-b79f-d1271fe5b0a0&width=2000&userId=&cache=v2)

- Get Student List
  Request
  ```jsx
  [GET] localhost:4000/student/student_list
  ```
  Body
  ```jsx
  NONE;
  ```
  - Response
    ```jsx
    [
      {
        areasOfInterest: ["Computer Vision", "ML"],
        address: "12 371-A Nandanam",
        linkedin: "https://www.linkedin.com/in/nmpaiaa/",
        github: "https://github.com/nandakishormpai",
        otherLinks: "https://nmpai.tech",
        __t: "Student",
        _id: "62d805ee8af1a40cbf710cdf",
        userId: "244u62",
        email: "nandakishormpai@cet.ac.in",
        password:
          "$2a$10$rUkYc0Ajs5rMEKWxDU24NOXnT/kDbZe5sLFTKM36K/jTSEbYy1rRy",
        firstName: "Nanda Kishor",
        lastName: "M Pai",
        cgpa: 9.68,
        degree: "BTech",
        higherSecondary: {
          _id: "62d805ee8af1a40cbf710ce0",
          board: "State",
          cgpa: 99.5,
        },
        yearOfJoining: 2019,
        expectedGraduationYear: 2023,
        department: "CSE",
        updated: "2022-07-23T12:12:43.920Z",
        __v: 0,
      },
      {
        areasOfInterest: ["Web Development", "Backend"],
        address: null,
        linkedin: "https://www.linkedin.com/in/sourav/",
        github: "https://github.com/sourav",
        otherLinks: "https://sourav.co",
        __t: "Student",
        _id: "62dbde346627ba086f9f7be6",
        userId: "144u62",
        email: "souravsatheesh@cet.ac.in",
        password:
          "$2a$10$tKg2yZQD7J4MMsMDmmlxK.pMst0VZp/aiYW2FskBCwaTbxrbtZ/fm",
        firstName: "Sourav",
        lastName: "Satheesh",
        cgpa: 9.99,
        degree: "BTech",
        higherSecondary: {
          _id: "62dbde346627ba086f9f7be7",
          board: "CBSE",
          cgpa: 95,
        },
        yearOfJoining: 2021,
        expectedGraduationYear: 2025,
        department: "ECE",
        updated: "2022-07-23T12:10:45.999Z",
        __v: 0,
      },
    ];
    ```
- Get Department Wise Student List
  Request
  ```jsx
  [GET] localhost:4000/student/student_list?department=ECE
  ```
  Body
  ```jsx
  NONE;
  ```
  - Response
    ```jsx
    [
      {
        areasOfInterest: ["Web Development", "Backend"],
        address: null,
        linkedin: "https://www.linkedin.com/in/sourav/",
        github: "https://github.com/sourav",
        otherLinks: "https://sourav.co",
        __t: "Student",
        _id: "62dbde346627ba086f9f7be6",
        userId: "144u62",
        email: "souravsatheesh@cet.ac.in",
        password: "$2*Y*H&*T*%^*%*TGGIUHOIHOIJIJOLJLLUIGUFYF#",
        firstName: "Sourav",
        lastName: "Satheesh",
        cgpa: 9.99,
        degree: "BTech",
        higherSecondary: {
          _id: "62dbde346627ba086f9f7be7",
          board: "CBSE",
          cgpa: 95,
        },
        yearOfJoining: 2021,
        expectedGraduationYear: 2025,
        department: "ECE",
        updated: "2022-07-23T12:10:45.999Z",
        __v: 0,
      },
    ];
    ```
- Get Alumni List
  Request
  ```jsx
  [GET] localhost:4000/alumni/alumni_list
  ```
  Body
  ```jsx
  NONE;
  ```
  - Response
    ```jsx
    [
      {
        areasOfInterest: ["NLP"],
        address: "12 371-A Nandanam",
        linkedin: "https://www.linkedin.com/in/nmpai/",
        github: "https://github.com/nandakishormpai",
        otherLinks: "https://nmpai.tech",
        __t: "Alumni",
        _id: "62d811f324982d1c0f6292b3",
        userId: "2452yt",
        email: "rajeevsuresh@gmail.com",
        password: "$2*Y*H&*T*%^*%*TGGIUHOIHOIJIJOLJLLUIGUFYF#",
        firstName: "Rajeev",
        lastName: "Suresh",
        department: "ECE",
        higherStudies: [
          {
            _id: "62d811f324982d1c0f6292b4",
            degree: "Mtech",
            university: "KTU",
            yearGraduation: 2020,
          },
          {
            _id: "62d811f324982d1c0f6292b5",
            degree: "PhD",
            university: "KTU",
            yearGraduation: 2022,
          },
        ],
        workExperience: [
          {
            _id: "62d811f324982d1c0f6292b6",
            from: 2019,
            to: 2021,
            company: "IBS",
            role: "MLE",
          },
        ],
        publications: [],
        updated: "2022-07-20T14:33:59.069Z",
        __v: 0,
      },
      {
        areasOfInterest: ["NLP", "Computer Vision", "ML"],
        address: null,
        linkedin: null,
        github: null,
        otherLinks: null,
        __t: "Alumni",
        _id: "62dbd9ca3be2e10775087338",
        userId: "1213yt",
        email: "christin@gmail.com",
        password:
          "$2a$10$CEPXoWxz8jRIgOAwqJSN8uLPI6ojZflwVgk2ApWskECAI6mJN28u2",
        firstName: "Christin",
        lastName: "Suni",
        department: "ECE",
        workExperience: [
          {
            _id: "62dbd9ca3be2e10775087339",
            from: 2001,
            to: 2011,
            company: "TC",
            role: "SDE-1",
          },
        ],
        higherStudies: [
          {
            _id: "62dbdbb23be2e1077508733f",
            degree: "Mtech",
            university: "NIT",
            yearGraduation: 2005,
          },
          {
            _id: "62dbdbb23be2e10775087340",
            degree: "PhD",
            university: "IIT",
            yearGraduation: 2012,
          },
        ],
        publications: [],
        updated: "2022-07-23T11:29:54.985Z",
        __v: 0,
      },
    ];
    ```
- Get Department Wise Alumni List
  Request
  ```jsx
  localhost:4000/alumni/alumni_list?department=ECE
  ```
  Body
  ```jsx
  NONE;
  ```
  - Response
    ```jsx
    [
      {
        areasOfInterest: ["NLP"],
        address: "12 371-A Nandanam",
        linkedin: "https://www.linkedin.com/in/nmpai/",
        github: "https://github.com/nandakishormpai",
        otherLinks: "https://nmpai.tech",
        __t: "Alumni",
        _id: "62d811f324982d1c0f6292b3",
        userId: "2452yt",
        email: "rajeevsuresh@gmail.com",
        password: "$2*Y*H&*T*%^*%*TGGIUHOIHOIJIJOLJLLUIGUFYF#",
        firstName: "Rajeev",
        lastName: "Suresh",
        department: "ECE",
        higherStudies: [
          {
            _id: "62d811f324982d1c0f6292b4",
            degree: "Mtech",
            university: "KTU",
            yearGraduation: 2020,
          },
          {
            _id: "62d811f324982d1c0f6292b5",
            degree: "PhD",
            university: "KTU",
            yearGraduation: 2022,
          },
        ],
        workExperience: [
          {
            _id: "62d811f324982d1c0f6292b6",
            from: 2019,
            to: 2021,
            company: "IBS",
            role: "MLE",
          },
        ],
        publications: [],
        updated: "2022-07-20T14:33:59.069Z",
        __v: 0,
      },
      {
        areasOfInterest: ["NLP", "Computer Vision", "ML"],
        address: null,
        linkedin: null,
        github: null,
        otherLinks: null,
        __t: "Alumni",
        _id: "62dbd9ca3be2e10775087338",
        userId: "1213yt",
        email: "christin@gmail.com",
        password: "$2*Y*H&*T*%^*%*TGGIUHOIHOIJIJOLJLLUIGUFYF#",
        firstName: "Christin",
        lastName: "Suni",
        department: "ECE",
        workExperience: [
          {
            _id: "62dbd9ca3be2e10775087339",
            from: 2001,
            to: 2011,
            company: "TC",
            role: "SDE-1",
          },
        ],
        higherStudies: [
          {
            _id: "62dbdbb23be2e1077508733f",
            degree: "Mtech",
            university: "NIT",
            yearGraduation: 2005,
          },
          {
            _id: "62dbdbb23be2e10775087340",
            degree: "PhD",
            university: "IIT",
            yearGraduation: 2012,
          },
        ],
        publications: [],
        updated: "2022-07-23T11:29:54.985Z",
        __v: 0,
      },
    ];
    ```
- Alumni Filter
  Request

  ```jsx
  [GET] localhost:4000/alumni/filter
  ```

  Body [All fields are optional] [Area of Interest all of them should be in the alumni’s interest]

  ```jsx
  {

      "areasOfInterest":["Computer Vision","ML"],
      "department":"ECE",
      "before":2010,
      "after":1990
  }
  ```

  - Response
    ```jsx
    [
      {
        areasOfInterest: ["NLP", "Computer Vision", "ML"],
        address: null,
        linkedin: null,
        github: null,
        otherLinks: null,
        __t: "Alumni",
        _id: "62dbd9ca3be2e10775087338",
        userId: "1213yt",
        email: "christin@gmail.com",
        password:
          "$2a$10$CEPXoWxz8jRIgOAwqJSN8uLPI6ojZflwVgk2ApWskECAI6mJN28u2",
        firstName: "Christin",
        lastName: "Suni",
        department: "ECE",
        workExperience: [
          {
            _id: "62dbd9ca3be2e10775087339",
            from: 2001,
            to: 2011,
            company: "TC",
            role: "SDE-1",
          },
        ],
        higherStudies: [
          {
            _id: "62dbdbb23be2e1077508733f",
            degree: "Mtech",
            university: "NIT",
            yearGraduation: 2005,
          },
          {
            _id: "62dbdbb23be2e10775087340",
            degree: "PhD",
            university: "IIT",
            yearGraduation: 2012,
          },
        ],
        publications: [],
        updated: "2022-07-23T11:29:54.985Z",
        __v: 0,
        yearGraduation: 2000,
      },
    ];
    ```

- Get Alumni Profile Details
  Request
  ```jsx
  [GET] localhost:4000/alumni/alumni_details?userId=2452yt
  ```
  Body
  ```jsx
  NONE;
  ```
  - Response
    ```jsx
    {
        "areasOfInterest": [
            "NLP"
        ],
        "address": "12 371-A Nandanam",
        "linkedin": "https://www.linkedin.com/in/nmpai/",
        "github": "https://github.com/nandakishormpai",
        "otherLinks": "https://nmpai.tech",
        "__t": "Alumni",
        "_id": "62d811f324982d1c0f6292b3",
        "userId": "2452yt",
        "email": "rajeevsuresh@gmail.com",
        "password": "$2*Y*H&*T*%^*%*TGGIUHOIHOIJIJOLJLLUIGUFYF#",
        "firstName": "Rajeev",
        "lastName": "Suresh",
        "department": "ECE",
        "higherStudies": [
            {
                "_id": "62d811f324982d1c0f6292b4",
                "degree": "Mtech",
                "university": "KTU",
                "yearGraduation": 2020
            },
            {
                "_id": "62d811f324982d1c0f6292b5",
                "degree": "PhD",
                "university": "KTU",
                "yearGraduation": 2022
            }
        ],
        "workExperience": [
            {
                "_id": "62d811f324982d1c0f6292b6",
                "from": 2019,
                "to": 2021,
                "company": "IBS",
                "role": "MLE"
            }
        ],
        "publications": [],
        "updated": "2022-07-20T14:33:59.069Z",
        "__v": 0,
        "yearGraduation": 2019
    }
    ```
- Get Student Profile Details
  Request
  ```jsx
  [GET] localhost:4000/student/student_details?userId=144u62
  ```
  Body
  ```jsx
  NONE;
  ```
  - Response
    ```jsx
    {
        "areasOfInterest": [
            "Web Development",
            "Backend"
        ],
        "address": null,
        "linkedin": "https://www.linkedin.com/in/sourav/",
        "github": "https://github.com/sourav",
        "otherLinks": "https://sourav.co",
        "__t": "Student",
        "_id": "62dbde346627ba086f9f7be6",
        "userId": "144u62",
        "email": "souravsatheesh@cet.ac.in",
        "password": "$2*Y*H&*T*%^*%*TGGIUHOIHOIJIJOLJLLUIGUFYF#",
        "firstName": "Sourav",
        "lastName": "Satheesh",
        "cgpa": 9.99,
        "degree": "BTech",
        "higherSecondary": {
            "_id": "62dbde346627ba086f9f7be7",
            "board": "CBSE",
            "cgpa": 95
        },
        "yearOfJoining": 2021,
        "expectedGraduationYear": 2025,
        "department": "ECE",
        "updated": "2022-07-23T12:10:45.999Z",
        "__v": 0
    }
    ```
- Get Blog List
  Request
  ```jsx
  [GET] localhost:4000/blog/
  ```
  Body
  ```jsx
  NONE;
  ```
  - Response
    ```jsx
    [
      {
        domain: ["machine learning"],
        _id: "62d815590a5c4b20009b8b05",
        title: "Intro to ML",
        content:
          "Machine learning (ML) is a type of artificial intelligence (AI) that allows software applications to become more accurate at predicting outcomes without being explicitly programmed to do so. Machine learning algorithms use historical data as input to predict new output values.",
        userId: "2452yt",
        firstName: "Rajeev",
        lastName: "Suresh",
        __v: 0,
        blogId: "b67876",
      },
      {
        domain: ["computer vision", "python"],
        _id: "62dbdd316627ba086f9f7be4",
        title: "Computer Vision and Python",
        content:
          "Computer vision is a discipline that studies how to reconstruct, interrupt and understand a 3d scene from its 2d images, in terms of the properties of the structure present in the scene.",
        userId: "1213yt",
        firstName: "Christin",
        lastName: "Suni",
        __v: 0,
        blogId: "b62345",
      },
    ];
    ```
- Get Individual Blog
  Request
  ```jsx
  [GET] localhost:4000/blog?blogId=b67876
  ```
  Body
  ```jsx
  NONE;
  ```
  - Response
    ```jsx
    [
      {
        domain: ["machine learning"],
        _id: "62d815590a5c4b20009b8b05",
        title: "Intro to ML",
        content:
          "Machine learning (ML) is a type of artificial intelligence (AI) that allows software applications to become more accurate at predicting outcomes without being explicitly programmed to do so. Machine learning algorithms use historical data as input to predict new output values.",
        userId: "2452yt",
        firstName: "Rajeev",
        lastName: "Suresh",
        __v: 0,
        blogId: "b67876",
      },
    ];
    ```
