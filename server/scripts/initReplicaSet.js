import 'dotenv/config';
import mongoose from 'mongoose';

const uri=process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/candilicious';
const direct=`${uri}${uri.includes('?')?'&':'?'}directConnection=true`;
try{
  await mongoose.connect(direct,{serverSelectionTimeoutMS:8000});
  const admin=mongoose.connection.db.admin();
  const hello=await admin.command({hello:1});
  if(!hello.setName){
    await admin.command({replSetInitiate:{_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]}});
    console.log('Initialized the local rs0 replica set. It may take a few seconds to elect its primary.');
  }else{
    console.log(`Replica set ${hello.setName} is already configured.`);
  }
}catch(error){
  if(error.codeName==='AlreadyInitialized')console.log('Replica set is already initialized.');
  else{console.error(`Could not initialize the local replica set: ${error.message}`);process.exitCode=1}
}finally{
  await mongoose.disconnect();
}
