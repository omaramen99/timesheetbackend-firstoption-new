const User = require('../models/User_model');
const Task = require('../models/Task_model');
const Project = require('../models/Project_model');
const Week = require('../models/Week_model');
const convert = require('xml-js');
const Department = require('../models/Department_model');
const Team = require('../models/Team_model');



const { Mongoose } = require('mongoose');
const  mongoose  = require('mongoose');






module.exports = {
// setUserHRate(req, res, next)
// {
//   User.updateMany({},{HourRate:1}).then((users) => {
//     res.status(200).send("ok");
//   }).catch(next);
// },
  GetUsersTasks(req, res, next)
  {
  var CheckIfProjectExistInArray = (projectsInfoArray,projectID) =>
  {
    for (let i = 0; i < projectsInfoArray.length; i++) {
      
      if (projectsInfoArray[i].Project_Name == projectID) {
        return {exist:true,index:i}
      }
    }
    return {exist:false,index:-1}
  }
  var CheckIfProjectExistInWeekArray = (weeksInfoArray,weekID) =>
  {
    for (let i = 0; i < weeksInfoArray.length; i++) {
      
      if (weeksInfoArray[i].Week == weekID) {
  
        return {exist:true,index:i}
      }
    }
    
    return {exist:false,index:-1}

  }

  var ConvertProjectIdToProjectName = (ProjectId, projectsArr) => 
  {
    for (let i = 0; i < projectsArr.length; i++) {

      if (projectsArr[i]._id.toString() == ProjectId) {
        return projectsArr[i].Name
      }
      
    }
    return "UNKNOWN"

  }


  var ConvertWeekIdToWeekDate = (WeekId, weeksArr) => 
  {
    for (let i = 0; i < weeksArr.length; i++) {

  if (weeksArr[i]._id.toString() == WeekId) {

    // console.log(weeksArr[i].Start_Fri.getFullYear());
    //console.log(weeksArr[i].Start_Fri.getFullYear());
    
    return `${weeksArr[i].Start_Fri.getDate()}-${weeksArr[i].Start_Fri.getMonth()+1}-${weeksArr[i].Start_Fri.getFullYear()}`
  }

    }

    return "??-??-????"

  }



    
    var userId = new mongoose.Types.ObjectId(req.query.userId);
    let projectsInfo = [];
    let weeksInfo = [];
    
    User.findById(req.query.userId)
    .then((user) => {
      let userInfo = {
        Name : user.Name,
        A_W : 0, 
        A_O : 0, 
        D_W : 0, 
        D_O : 0, 
        T_W : 0, 
        T_O : 0
      };

      
      Task.find({UserID: userId})
      .then((tasks)=>{
        // console.log(tasks.length);
        // res.status(200).send(tasks);
        for (let i = 0; i < tasks.length; i++) {
          let projectInfo = {
            Project_Name : "",
            P_A_W : 0, 
            P_A_O : 0, 
            P_D_W : 0, 
            P_D_O : 0, 
            P_T_W : 0, 
            P_T_O : 0
          };
          let weekInfo = {
            Week : "",
            W_A_W : 0, 
            W_A_O : 0, 
            W_D_W : 0, 
            W_D_O : 0, 
            W_T_W : 0, 
            W_T_O : 0
          };

          var W = tasks[i].WorkingDetails.D0.W + tasks[i].WorkingDetails.D1.W + tasks[i].WorkingDetails.D2.W + tasks[i].WorkingDetails.D3.W + tasks[i].WorkingDetails.D4.W;
          var O = tasks[i].WorkingDetails.D0.O + tasks[i].WorkingDetails.D1.O + tasks[i].WorkingDetails.D2.O + tasks[i].WorkingDetails.D3.O + tasks[i].WorkingDetails.D4.O + tasks[i].WorkingDetails.D5.O + tasks[i].WorkingDetails.D6.O;
          if (tasks[i].IsApproved)
          {
            userInfo.A_W += W;
            userInfo.A_O += O;
          }else
          {
            userInfo.D_W += W;
            userInfo.D_O += O;
          }
          userInfo.T_W += W;
          userInfo.T_O += O;

          ///////////////////////////////////////////////////

          var existence = CheckIfProjectExistInArray(projectsInfo,tasks[i].ProjectID.toString())
          if (existence.exist) {
            var existedProjectInfo = projectsInfo[existence.index];
            if (tasks[i].IsApproved) 
            {
              existedProjectInfo.P_A_W += W;
              existedProjectInfo.P_A_O += O;
            }else
            {
              existedProjectInfo.P_D_W += W;
              existedProjectInfo.P_D_O += O;
            }
            existedProjectInfo.P_T_W += W;
            existedProjectInfo.P_T_O += O;

          }else
          {
            if (tasks[i].IsApproved) 
            {
              projectInfo.P_A_W += W;
              projectInfo.P_A_O += O;
            }else
            {
              projectInfo.P_D_W += W;
              projectInfo.P_D_O += O;
            }
            projectInfo.P_T_W += W;
            projectInfo.P_T_O += O;
            projectInfo.Project_Name = tasks[i].ProjectID.toString();
            projectsInfo.push(projectInfo)
          }
        

        ////////////////////////////////////////////////////////##############################################################

        var existencee = CheckIfProjectExistInWeekArray(weeksInfo,tasks[i].WeekID.toString())
        if (existencee.exist) {
          var existedWeekInfo = weeksInfo[existencee.index];
          if (tasks[i].IsApproved)
          {
            existedWeekInfo.W_A_W += W;
            existedWeekInfo.W_A_O += O;
          }else
          {
            existedWeekInfo.W_D_W += W;
            existedWeekInfo.W_D_O += O;
          }
          existedWeekInfo.W_T_W += W;
          existedWeekInfo.W_T_O += O;

        }else
        {
          if (tasks[i].IsApproved) 
          {
            weekInfo.W_A_W += W;
            weekInfo.W_A_O += O;
          }else
          {
            weekInfo.W_D_W += W;
            weekInfo.W_D_O += O;
          }
          weekInfo.W_T_W += W;
          weekInfo.W_T_O += O;
          weekInfo.Week = tasks[i].WeekID.toString();
          weeksInfo.push(weekInfo)
        }
      }

      let ProjectsIDS = [];
      for (let j = 0; j < projectsInfo.length; j++) {
        
        ProjectsIDS.push(new mongoose.Types.ObjectId(projectsInfo[j].Project_Name));

      }


      let WeeksIDS = [];
      for (let j = 0; j < weeksInfo.length; j++) {
        WeeksIDS.push(new mongoose.Types.ObjectId(weeksInfo[j].Week));
      }

        ////////////////////////////////////////////////
        Project.find({_id:{$in:ProjectsIDS}}).then(projects => {
          for (let ii = 0; ii < projectsInfo.length; ii++) {
            projectsInfo[ii].Project_Name = ConvertProjectIdToProjectName(projectsInfo[ii].Project_Name, projects)
          }

          Week.find({_id:{$in:WeeksIDS}}).then(weeks => {
            for (let ii = 0; ii < weeksInfo.length; ii++) {
              weeksInfo[ii].Week = ConvertWeekIdToWeekDate(weeksInfo[ii].Week, weeks)
            }

            var options = {compact: true, ignoreComment: true, spaces: 4};
            var A = convert.json2xml({userInfo}, options);
            var B = convert.json2xml({projectsInfo}, options);
            var C = convert.json2xml({weeksInfo}, options);
            res.status(200).send(`<?xml version="1.0" encoding="UTF-8" ?> <root> <root1> ${A} </root1> <root1> ${B} </root1> <root1> ${C} </root1> </root>`);
          }).catch(next);
        }).catch(next)
      }).catch(next);
    }).catch(next);


  },
  GetProjectTasks(req, res, next)
  {
  var CheckIfUserExistInArray = (usersInfoArray,userID) =>
  {
    for (let i = 0; i < usersInfoArray.length; i++) {
      
      if (usersInfoArray[i].Name == userID) {
        return {exist:true,index:i}
      }
    }
    return {exist:false,index:-1}
  }
  var CheckIfTeamExistInArray = (teamsInfoArray,teamID) =>
  {
    for (let i = 0; i < teamsInfoArray.length; i++) {
      
      if (teamsInfoArray[i].team == teamID) {
        
        return {exist:true,index:i}

      }
    }
    
    return {exist:false,index:-1}
  }

  var ConvertUserIdToUserName_Dep = (ProjectId, projectsArr) => 
  {
    for (let i = 0; i < projectsArr.length; i++) {

      if (projectsArr[i]._id.toString() == ProjectId) {
        return {n:projectsArr[i].Name,d:projectsArr[i].DepartmentName,r:projectsArr[i].HourRate}
      }
      
    }
    return {n:"UNKNOWN",d:"UNKNOWN",r:100}

  }
  var ConvertTeamIdToTeamName = (ProjectId, projectsArr) => 
  {
    for (let i = 0; i < projectsArr.length; i++) {

      if (projectsArr[i]._id.toString() == ProjectId) {
        return {n:projectsArr[i].Name,l:projectsArr[i].Leader.toString()}
      }
      
    }
    return {n:"UNKNOWN",d:"UNKNOWN"}

  }

  var ConvertWeekIdToWeekDate = (WeekId, weeksArr) => 
  {
    for (let i = 0; i < weeksArr.length; i++) {

  if (weeksArr[i]._id.toString() == WeekId) {

    // console.log(weeksArr[i].Start_Fri.getFullYear());
    //console.log(weeksArr[i].Start_Fri.getFullYear());
    
    return `${weeksArr[i].Start_Fri.getDate()}-${weeksArr[i].Start_Fri.getMonth()+1}-${weeksArr[i].Start_Fri.getFullYear()}`
  }

    }

    return "??-??-????"

  }



    
    var projectId = new mongoose.Types.ObjectId(req.query.projectId);
    let usersInfo = [];
    let teamsInfo = [];
    
    Project.findById(req.query.projectId)
    .then((p) => {
      let projectInfo = {
        Name : p.Name,
        A_W : 0, 
        A_O : 0, 
        D_W : 0, 
        D_O : 0, 
        T_W : 0, 
        T_O : 0,
        ProjectCost:0
      };

      
      Task.find({ProjectID: projectId})
      .then((tasks)=>{

        for (let i = 0; i < tasks.length; i++) {
          let userInfo = {
            Name : "",
            Dep : "",
            Rate:0,
            P_A_W : 0, 
            P_A_O : 0, 
            P_D_W : 0, 
            P_D_O : 0, 
            P_T_W : 0, 
            P_T_O : 0,
            EmpCost:0

          };
          let teamInfo = {
            team : "",
           // leader:"",
            W_A_W : 0, 
            W_A_O : 0, 
            W_D_W : 0, 
            W_D_O : 0, 
            W_T_W : 0, 
            W_T_O : 0,
            TeamCost:0
          };

          var W = tasks[i].WorkingDetails.D0.W + tasks[i].WorkingDetails.D1.W + tasks[i].WorkingDetails.D2.W + tasks[i].WorkingDetails.D3.W + tasks[i].WorkingDetails.D4.W;
          var O = tasks[i].WorkingDetails.D0.O + tasks[i].WorkingDetails.D1.O + tasks[i].WorkingDetails.D2.O + tasks[i].WorkingDetails.D3.O + tasks[i].WorkingDetails.D4.O + tasks[i].WorkingDetails.D5.O + tasks[i].WorkingDetails.D6.O;
          if (tasks[i].IsApproved)
          {
            projectInfo.A_W += W;
            projectInfo.A_O += O;
          }else
          {
            projectInfo.D_W += W;
            projectInfo.D_O += O;
          }
          projectInfo.T_W += W;
          projectInfo.T_O += O;

          ///////////////////////////////////////////////////

          var existence = CheckIfUserExistInArray(usersInfo,tasks[i].UserID.toString())
          if (existence.exist) {
            var existedUserInfo = usersInfo[existence.index];
            if (tasks[i].IsApproved) 
            {
              existedUserInfo.P_A_W += W;
              existedUserInfo.P_A_O += O;
            }else
            {
              existedUserInfo.P_D_W += W;
              existedUserInfo.P_D_O += O;
            }
            existedUserInfo.P_T_W += W;
            existedUserInfo.P_T_O += O;

          }else
          {
            if (tasks[i].IsApproved) 
            {
              userInfo.P_A_W += W;
              userInfo.P_A_O += O;
            }else
            {
              userInfo.P_D_W += W;
              userInfo.P_D_O += O;
            }
            userInfo.P_T_W += W;
            userInfo.P_T_O += O;
            userInfo.Name = tasks[i].UserID.toString();
            //userInfo.Dep = tasks[i].DepartmentName;
            usersInfo.push(userInfo);
          }
        

        ////////////////////////////////////////////////////////##############################################################

        var existencee = CheckIfTeamExistInArray(teamsInfo,tasks[i].TeamID.toString())
        if (existencee.exist) {
          var existedTeamInfo = teamsInfo[existencee.index];
          if (tasks[i].IsApproved)
          {
            existedTeamInfo.W_A_W += W;
            existedTeamInfo.W_A_O += O;
          }else
          {
            existedTeamInfo.W_D_W += W;
            existedTeamInfo.W_D_O += O;
          }
          existedTeamInfo.W_T_W += W;
          existedTeamInfo.W_T_O += O;

        }else
        {
          if (tasks[i].IsApproved) 
          {
            teamInfo.W_A_W += W;
            teamInfo.W_A_O += O;
          }else
          {
            teamInfo.W_D_W += W;
            teamInfo.W_D_O += O;
          }
          teamInfo.W_T_W += W;
          teamInfo.W_T_O += O;
          teamInfo.team = tasks[i].TeamID.toString();
          teamsInfo.push(teamInfo)
        }
      }

      let UsersIDS = [];
      for (let j = 0; j < usersInfo.length; j++) {
        
        UsersIDS.push(new mongoose.Types.ObjectId(usersInfo[j].Name));

      }


      let TeamsIDS = [];
      for (let j = 0; j < teamsInfo.length; j++) {
        TeamsIDS.push(new mongoose.Types.ObjectId(teamsInfo[j].team));
      }

        ////////////////////////////////////////////////
        User.find({_id:{$in:UsersIDS}}).then(users => {
          var costRates = [];
          for (let ii = 0; ii < usersInfo.length; ii++) {
           var user = ConvertUserIdToUserName_Dep(usersInfo[ii].Name, users);
           usersInfo[ii].Dep = user.d;
           usersInfo[ii].Rate = user.r;
           usersInfo[ii].EmpCost = (usersInfo[ii].P_T_W+usersInfo[ii].P_T_O)*user.r;
           costRates = [...costRates,{id:usersInfo[ii].Name,cost:usersInfo[ii].EmpCost}]
           usersInfo[ii].Name = user.n;
           projectInfo.ProjectCost += usersInfo[ii].EmpCost;
          }

          Team.find({_id:{$in:TeamsIDS}}).then(teams => {
            for (let ii = 0; ii < teamsInfo.length; ii++) {
              for (let jj = 0; jj < teams.length; jj++) {
                if (teamsInfo[ii].team == teams[jj]._id.toString()) {
                  for (let kk = 0; kk < costRates.length; kk++) {
                    
                    if (costRates[kk].id == teams[jj].Leader.toString()) {
                      
                      teamsInfo[ii].TeamCost += costRates[kk].cost;

                    }else
                    {
                      for (let tt = 0; tt < teams[jj].Members.length; tt++) {
                          if (costRates[kk].id == teams[jj].Members[tt]) {
                            teamsInfo[ii].TeamCost += costRates[kk].cost;
                          }
                      }
                    }
                  }
                }
              }
            }

            var LeadersIDS = [];
            for (let ii = 0; ii < teamsInfo.length; ii++) {
              var team  = ConvertTeamIdToTeamName(teamsInfo[ii].team, teams)
              teamsInfo[ii].team = team.n
             // teamsInfo[ii].leader = team.l
              LeadersIDS.push(new mongoose.Types.ObjectId(team.l));
              
            }

            var options = {compact: true, ignoreComment: true, spaces: 4};
            var A = convert.json2xml({projectInfo}, options);
            var B = convert.json2xml({usersInfo}, options);
            var C = convert.json2xml({teamsInfo}, options);
            res.status(200).send(`<?xml version="1.0" encoding="UTF-8" ?> <root> <root1> ${A} </root1> <root1> ${C} </root1> <root1> ${B} </root1> </root>`);
          }).catch(next);
        }).catch(next)
      }).catch(next);
    }).catch(next);


  },



  allUsers(req, res, next){
    ///////////////Sort Logic/////////////////////////////////
    var sort = 1;
    var sortBy = "department";
    if (req.query.sort) { 
      if (req.query.sort == 'd') {sort = -1;}
    }
    if (req.query.sortBy) {sortBy = req.query.sortBy;}
    var SortOBJ = {};
    SortOBJ[sortBy] = sort;
    ////secondLayerNameSorting:-
    var secondLayerNameSorting = 1;
    if (sortBy == 'Name') {secondLayerNameSorting = sort;}
    //////////////////////////////////////////////////////////


    ///////////////Filter Logic///////////////////////////////
    var FilterOBJ = {};
   if (req.query.FilterByDepartment) {FilterOBJ["Department"] =  new mongoose.Types.ObjectId(req.query.FilterByDepartment) ;}
    //////////////////////////////////////////////////////////


    User.find(FilterOBJ).sort(SortOBJ).sort({Name:secondLayerNameSorting})
    .then(Users => {
      //console.log(Users.length); 

      res.status(200).send(Users)
    })
    .catch(next)

  },
  
  GetUser(req, res, next){
    User.findById(req.query.id)
    .then(User => {
      //console.log(User.Name); 

      res.status(200).send(User)
    })
    .catch(next)
  },
  GetUserData(req, res, next){
    User.findById(req.query.id)
    .then(User => {
     // console.log(User); 

      res.status(200).send({...User._doc,UserName:"",Password:""})
    })
    .catch(next)
  },
  GetUsers(req, res, next){
    var UsersIDs = req.body.UsersIDs;
    var Users = []
    for (let i = 0; i < UsersIDs.length; i++) {
      Users.push(mongoose.Types.ObjectId(UsersIDs[i])); 
    }

    User.find({'_id': { $in: Users}}).then(Users => {
     // console.log(Users.length); 
      res.status(200).send(Users)
    }).catch(next)

  },


  Login(req, res, next){
    User.find(req.body)
    .then(User => {
     // console.log(User[0].Name); 

      res.status(200).send(User[0])
    })
    .catch(next)
  },

  AddUser(req, res, next){
    const Credentials = req.body.Credentials;
    var isVarified = false;
    const data = req.body.data;
    const userProps = data;
    //console.log(userProps);

    //check Credentials
    User.find(Credentials).then(user => {
      if (user[0].Role != 'Admin') {

         // console.log('nope ---> not AUTHORIZED');
        
      }else{isVarified = true;
        //console.log('ok2 ---> IS ADMIN');
      }

      if (isVarified) {
        
        Department.findById(userProps.Department).then(dep => {
          var userToBeAdded = 
          {
            ...userProps,
            DepartmentName: dep.Name,
            DepartmentColor: dep.Color
          }
          User.create(userToBeAdded).then(user => {
            res.status(201).send(user);
          })
        }).catch(next)

        
      } else {res.status(401).send("not authorized!");
        
      }

    })
    .catch(next);

  },
    AddNewUser(req, res, next){
    const data = req.body;
    User.create(data).then(user => {
      res.status(201).send(user);
    }).catch(next)
  },
  EditCurrentUser(req, res, next){
    const data = req.body;
    const userId = req.query.id;
    console.log(data);
    console.log(userId);
    User.findByIdAndUpdate({_id: userId}, data,{new:true}).then(ress => {res.status(200).send(ress)}).catch(next);
  },

  EditUser(req, res, next){

    const Credentials = req.body.Credentials;
    var isVarified = false;
    const data = req.body.data;
    const userId = req.query.id;

    //check Credentials
    User.find(Credentials)
    .then(user => {
      if (user[0].Role != 'Admin') {
        if (user[0]._id == userId) {
          isVarified = true;
         // console.log('ok1 ---> AUTHORIZED');
        }
      }else{isVarified = true;//console.log('ok2 ---> IS ADMIN');
    }

      if (isVarified) {
        User.findByIdAndUpdate({_id: userId}, data).then(ress => {res.status(200).send("success")}).catch(next);

      } else {res.status(401).send("not authorized")}
      
    })
    .catch(next);
  },
  EditUserPasswordOrPhoto(req, res, next){


    const data = req.body;
    const userId = req.query.id;

    User.findByIdAndUpdate({_id: userId}, data).then(ress => {res.status(200).send("success")}).catch(next);

  },

  UpdateWeeklyHours(req, res, next){
    const weekId = req.query.id;
    var usersIDs = [];
    var users_W = [];
    var users_O = [];
    var usersTsks =[];
    User.find({Role:"Engineer"}).then(users => {
for (let i = 0; i < users.length; i++) {
      usersIDs.push(users[i]._id.toString());
      users_W.push(users[i].WorkedHours);
      users_O.push(users[i].OverTimeHours);
      usersTsks.push({W:0,O:0});
}
Task.find({ WeekID: weekId }).then(tsks => {
  for (let i = 0; i < tsks.length; i++) {
    var II = usersIDs.indexOf(tsks[i].UserID.toString());
    var old_W = usersTsks[II].W;
    var old_O = usersTsks[II].O;
    var new_W = 0;
    var new_O = 0;
    var workingDetails = tsks[i].WorkingDetails;
    new_W = workingDetails.D0.W + workingDetails.D1.W +workingDetails.D2.W + workingDetails.D3.W +workingDetails.D4.W;
    new_O = workingDetails.D0.O + workingDetails.D1.O +workingDetails.D2.O + workingDetails.D3.O +workingDetails.D4.O +workingDetails.D5.O +workingDetails.D6.O;
    usersTsks[II].W = old_W + new_W;
    usersTsks[II].O = old_O + new_O;
  }
  for (let i = 0; i < usersTsks.length; i++) {
    User.findByIdAndUpdate({_id: usersIDs[i]}, {WorkedHours:usersTsks[i].W + users_W[i], OverTimeHours:usersTsks[i].O + users_O[i] }).then(ress => {
      if (i == usersTsks.length - 1) {res.status(200).send("success")}
    }).catch(next);
  }
    }).catch(next);
    }).catch(next);
  },

  delete(req, res, next){
    const Credentials = req.body;
    var isVarified = false;
    const userId = req.query.id;

    User.find(Credentials)
    .then(user => {
      //console.log(user[0].Role);
      if (user[0].Role != 'Admin') {

        //console.log('nope ---> not AUTHORIZED');
      
    }else{isVarified = true;//console.log('ok2 ---> IS ADMIN')
    }

    if (isVarified) {
     
      User.findByIdAndRemove({_id: userId})
        .then(ress => res.status(202).send("success"))
        .catch(next);
    } else {res.status(401).send("not authorized!");
    }
    }).catch(next);

  }

};
