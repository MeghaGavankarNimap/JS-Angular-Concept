module.exports = async (req, res, next) => {
    try {
        let userId = await req.customerData.id;
        if (!req.customerData.isExternal) {
            return res.status(403).json({ message: 'Access Denied', msgKey: 'accessDenied' })
        }
        let requestInfo = { 'method': req.method, 'baseUrl': req.baseUrl, 'path': req.route.path }
        let systemInfo;

        await redisClient.get(`${userId}permissions`, async (err, result) => {
            if (err) {
                res.send(err);
            }
            else if (result) {
                result = JSON.parse(result);
                systemInfo = await result;
                if (systemInfo.length != 0) {
                    let access = false
                    await systemInfo.forEach(data => {
                        if (data.method.toLowerCase() === requestInfo.method.toLowerCase() && data.baseUrl.toLowerCase() === requestInfo.baseUrl.toLowerCase() && data.path.toLowerCase() === requestInfo.path.toLowerCase()) {
                            access = true;
                        }
                    });
                    if (access) {
                        req.permissionArray = systemInfo;
                        next();
                    } else {
                        res.status(403).json({ message: 'Access Denied', msgKey: 'accessDenied' })
                    }
                } else {
                    res.status(403).json({ message: 'Access Denied', msgKey: 'accessDenied' })
                }
            } else {
                let getRole = await models.userRole.getAllRole(userId);
                let roleId = await getRole.map((data) => data.roleId);
                let getPermissions = await models.rolePermission.findAll({
                    where: { roleId: { [Op.in]: roleId }, isActive: true },
                    attributes: ['permissionId']
                });
                let permissionId = await getPermissions.map((data) => data.permissionId);
                let systemInfoData = await models.permission.findAll({
                    where: { id: { [Op.in]: permissionId }, isActive: true },
                    attributes: ['method', 'baseUrl', 'path']
                });
                redisClient.set(`${userId}permissions`, JSON.stringify(systemInfoData));
                const todayEnd = new Date().setHours(23, 59, 59, 999);
                redisClient.expireat(`${userId}permissions`, parseInt(todayEnd / 1000));
                if (systemInfoData.length != 0) {
                    let access = false
                    await systemInfoData.forEach(data => {
                        if (data.method.toLowerCase() === requestInfo.method.toLowerCase() && data.baseUrl.toLowerCase() === requestInfo.baseUrl.toLowerCase() && data.path.toLowerCase() === requestInfo.path.toLowerCase()) {
                            access = true
                        }
                    })
                    if (access) {
                        next();
                    } else {
                        res.status(403).json({ message: 'Access Denied', msgKey: 'accessDenied' })
                    }
                } else {
                    res.status(403).json({ message: 'Access Denied', msgKey: 'accessDenied' })
                }
            }
        })
    } catch (err) {
        res.status(401).send(err);
    }
};


modules.exports=async(req,res,next) => {
    try{

    }
    catch(err){
        
    }
}

// ######
module.exports = router; 
// above is only used to export the file.after that we can import it using require.




 const router = express.Router(); 
// is used to create a new instance of an Express router. This router instance is used to define routes and middleware for your application.


router.get('/', checkAuth, wrapper(getOrderTracking));
//  This line defines a route handler for the HTTP GET method on the root URL ('/'). When a GET request is made to this URL, it will go through the checkAuth middleware first and then execute the getOrderTracking controller function wrapped by the wrapper utility function.
