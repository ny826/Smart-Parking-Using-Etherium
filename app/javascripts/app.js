import "../stylesheets/app.css";

// Import libraries we need.
import {  default as Web3 } from 'web3';
import {  default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import parking_artifacts from '../../build/contracts/Parking.json'

// Parking is our usable abstraction, which we'll use through the code below.
var Parking = contract(parking_artifacts);

var accounts, account;
var parking;


function getBalance(address) {
    return web3.fromWei(web3.eth.getBalance(address).toNumber(), 'ether');
}

window.App = {
    start: function() {
        var self = this;

        web3.eth.getAccounts(function(err, accs) {
            if (err != null) {
                alert("There was an error fetching your accounts.");
                return;
            }

            if (accs.length == 0) {
                alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
                return;
            }


            accounts = accs;
            //console.log(accounts);
            
            self.initializeParking();
        });
    },

    initializeParking: function() {
        var self = this;
        Parking.deployed().then(function(instance) {
            parking = instance;
            $("#parkAddress").html(parking.address);

            self.checkValues();
        }).catch(function(e) {
            console.log(e);
        });
    },

    checkValues: function() {
        Parking.deployed().then(function(instance) {
            parking = instance;
	}).then(
            function() {
                    return getBalance(parking.address);
                }).then(

                function(balance) {
                    $("#parkBalance").html(balance);
                    
                
        }).catch(function(e) {
            console.log(e);
        });
    },

    
addVehicle: function(Address,vehicleNum) {
       var self = this;
      Parking.deployed().then(function(instance) {
          parking = instance;
           parking.addVehicle(Address, vehicleNum,{
               from:accounts[0],gas:900000
           }).then(
	
                function() {
                   return parking.vehicleMap.call(Address);
              }).then(
               function(val) {
                   var msgResult;
console.log("entered");
                   if (val.toNumber() ==vehicleNum) {
                       msgResult = "adding successful";
		       $("#table1").append(
			"<tr><td>" + val.toNumber() + "</td><td>" +  Address  + "</td></tr>" 
			);
                   } else {
                       msgResult = "adding failed";
                   }  
                   $("#vehicleAddResult").html(msgResult);
		
               })
       }).catch(function(e) {
           console.log(e);
       });
   },
    
   checkIn: function(checkInTime, Address, vehicleNum) {
       var self = this;
      Parking.deployed().then(function(instance) {
          parking = instance;
           parking.checkIn(checkInTime, Address, vehicleNum,{
               from:accounts[0],gas:900000
           }).then(
               function() {
                   return parking.vehicleCheckIn.call(Address);
               }).then(
               function(val) {
                   var msgResult;
                   if (val.toNumber() == checkInTime) {
                       msgResult = "Check In Successful";
		       $("#table2").append(
			"<tr><td>" + val.toNumber() + "</td><td>" + vehicleNum + "</td><td>"+  Address  + "</td></tr>" 
			);
                   } else {
                       msgResult = "Check In Failed";
                   }
                   $("#checkInResult").html(msgResult);
		
               })
       }).catch(function(e) {
           console.log(e);
       });
   },

   checkOut: function(vehicleNum, offer, checkOutTime) {
       var self = this;
       var tempadd;
      Parking.deployed().then(function(instance) {
          parking = instance;
           parking.checkOut(vehicleNum, offer, checkOutTime,{
               from:accounts[0],gas:900000
           }).then( function() {
		   return parking.vehicleMapRev.call(vehicleNum);
	      }).then(
               function(Address) {
		   tempadd = Address;
                   return parking.vehicleCheckOut.call(tempadd);
               }).then(
               function(val) {
                   var msgResult;
                   if (val.toNumber() == checkOutTime) {
                       msgResult = "Check Out Successful"; 
		    
		   } else {
                       msgResult = "Check In Failed";
                   }
                   $("#checkOutResult").html(msgResult);
		   return parking.vehiclePrice.call(tempadd);
               }).then(
		function(finalp) {
		   $("#checkOutAmount").val(finalp);
		  })		
		}).catch(function(e) {
           console.log(e);
       });
   },

   payment: function(payAddress) {
       var self = this;
       var tempadd;
       var tempin;
       var tempout;
       var tempamount;
       var tempvnum;
       var tempoffer;
      Parking.deployed().then(function(instance) {
          parking = instance;
           parking.payment(payAddress,{
               from: accounts[0],
	       value: $("#checkOutAmount").val()

           }).then( function() { console.log("pay");
		   return parking.vehiclePayAccountRev.call(payAddress);
	      }).then(
               function(Address) {
		   tempadd = Address;
                   return parking.vehicleCheckOut.call(tempadd);
               }).then(
		function(tempa) {
		   tempout = tempa;
		   return parking.vehicleCheckIn.call(tempadd);
		}).then(
		function(tempb) {
		   tempin = tempb;
		   return parking.vehicleMap.call(tempadd);
		}).then(
		function(tempc) {
		   tempvnum = tempc;
		   return parking.vehicleOffer.call(tempadd);
		}).then(
		function(tempd) {
		   tempoffer = tempd;
		   return parking.vehiclePrice.call(tempadd);
		}).then(
               function(val) {

		   tempamount = val;
                   var msgResult;
                        msgResult = "Payment Successful";
			$("#table3").append(
			"<tr><td>" + tempin + "</td><td>" + tempout + "</td><td>"+  tempvnum + "</td><td>"+ tempoffer + "</td><td>"+ tempamount + "</td><td>"+ payAddress + "</td></tr>" 
			);
		   $("#payResult").html(msgResult);
		
               }).then(
                function() {
                    $("#parkBalance").html(getBalance(parking.address));
                });
       }).catch(function(e) {
           console.log(e);
       });
   }

};
window.addEventListener('load', function() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    Parking.setProvider(web3.currentProvider);
    App.start();

    // Wire up the UI elements
    
    $("#vehicleAdd").click(function() {
        var val = $("#vehicleAddNum").val();
        var ownerAddress = $("#vehicleAddOwner").val();
        App.addVehicle(ownerAddress, val);  
    });

    $("#checkIn").click(function() {
        var val = $("#vehicleCheckInNum").val();
        var ownerAddress = $("#vehicleCheckInOwner").val();
        var time = $("#vehicleCheckInTime").val();
        App.checkIn(time, ownerAddress, val);
    });
    
   $("#checkOut").click(function() {
        var val = $("#vehicleCheckOutNum").val();
        var code = $("#vehicleOffer").val();
        var time = $("#vehicleCheckOutTime").val();
	
        App.checkOut(val, code, time);
    });
 
   
   $("#pay").click(function() {
	
		var payAddress = $("#area").val();
	App.payment(payAddress);	
   
    });
});

