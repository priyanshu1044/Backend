// for import use this command:
// mongoimport --db mydatabase --collection mycollection --file path/to/sample.json --jsonArray
files 

nodetest.orders.json
nodetest.venders.json
nodetest.resellers.json


// 1. read data from orders resllers and vendor
D:\Priyanshu\Task>
mongoimport --collection=orders --db=task_db --type=json --jsonArray nodetest.orders.json
mongoimport --collection=venders --db=task_db --type=json --jsonArray nodetest.venders.json
mongoimport --collection=resellers --db=task_db --type=json --jsonArray nodetest.resellers.json

===================================================================================================

mongosh
use task_db
show collections

db.orders.find()
db.venders.find()
db.resellers.find()




// 2. upadate resller and vendor data with out id
db.venders.updateOne(
    { "vendor_name": "Vendor Name" },
    {
      $set: {
        "vendor_name": "Updated Vendor Name",
        "is_mobile_verified": true,
        "status_verified": false
      }
    }
  );
  

// 3. read vendor data by id 
db.venders.find({ "_id": ObjectId("63997596ab06444e928f666c") })
  


// 4. vendor record updated by id  
db.venders.updateOne(
    { "_id": ObjectId("6133387d05d7671398544b94") },
    {
      $set: {
        "vendor_name": "Updated Vendor Name",
        "is_mobile_verified": true,
        "status_verified": false
      }
    }
  );



// 5. delete resller by id 

db.resellers.deleteOne({ "_id": ObjectId("613660ef231e3741b8c1d115") })


// 6. update order tracking statush by id of order

db.orders.updateOne(
    { "_id": ObjectId("618b5f3dd70e0c1a18536c45") },
    {
      $set: {
        "tracking_status": "delivered"
      }
    }
  );


// 7. find vender order by status

db.venders.find({ "tracking_status": "delivered" })


// 8. add and remove follow request from vendor to resller 


db.venders.updateOne(
    { "_id": ObjectId("6133387d05d7671398544b94") },//vender id
    { $addToSet: { "follow_requests": ObjectId("613660ef231e3741b8c1d115") } }//resller id
);
db.venders.updateOne(
    { "_id": ObjectId("6133387d05d7671398544b94") },
    { $pull: { "follow_requests": ObjectId("613660ef231e3741b8c1d115") } }
);


// 9. filter orders from same vendor followd by same resller
db.orders.find({ "vendor_id": ObjectId("6133387d05d7671398544b94"), "follow_requests": ObjectId("613660ef231e3741b8c1d115") })