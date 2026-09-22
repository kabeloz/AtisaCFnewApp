@path: '/admin'
service AdminService {

    entity CurrentAdmin {

        key ID : String;

        Email : String;

        First_Name : String;

        Last_Name : String;

        Role : String;

        Is_Active : Boolean;

        Created_At : DateTime;

        Updated_At : DateTime;
    }


    function testConnection() returns String;

}