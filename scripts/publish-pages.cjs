const {spawnSync}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
process.chdir(path.resolve(__dirname,'..'));
function run(command,args,capture=false){
  const result=spawnSync(command,args,{encoding:'utf8',stdio:capture?['ignore','pipe','inherit']:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)throw Error(command+' failed');
  return result.stdout?.trim();
}
if(run('git',['status','--porcelain'],true))throw Error('Commit source changes before publishing');
if(run('git',['config','user.name'],true)!=='AnySpOC'||run('git',['config','user.email'],true)!=='53645031+AnySpOC@users.noreply.github.com')throw Error('Unexpected commit identity');
if(run('gh',['api','user','--jq','.login'],true)!=='AnySpOC')throw Error('Unexpected GitHub account');
if(run('git',['remote','get-url','origin'],true)!=='https://github.com/AnySpOC/orbit-explorer.git')throw Error('Unexpected publication repository');
const head=run('git',['rev-parse','HEAD'],true);
const remote=run('git',['ls-remote','origin','refs/heads/main'],true).split(/\s+/)[0];
if(remote!==head)throw Error('Push this source commit to origin/main before publishing');
const tests=fs.readdirSync('tests').filter(n=>n.endsWith('.test.cjs')).map(n=>'tests/'+n);
run(process.execPath,['--test',...tests]);
run(process.execPath,['scripts/verify-publication.cjs']);
const artifact=run('git',['subtree','split','--prefix=dist'],true);
if(!/^[a-f0-9]{40}$/.test(artifact))throw Error('Unexpected artifact commit');
run('git',['push','origin',artifact+':refs/heads/gh-pages']);
console.log('Pages artifact pushed from source '+head+'. Check GitHub Pages build status.');
