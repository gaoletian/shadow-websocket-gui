const args = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const currentVersion = require('../package.json').version;
const {prompt} = require('enquirer');
const execa = require('execa');

const preId = args.preid || (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0]) || 'alpha';
const isDryRun = args.dry;
const skipTests = args.skipTests;
const skipBuild = args.skipBuild;

const versionIncrements = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];

const inc = i => semver.inc(currentVersion, i, preId);
const bin = name => path.resolve(__dirname, '../node_modules/.bin/' + name);
const run = (bin, args, opts = {}) => execa(bin, args, {stdio: 'inherit', ...opts});

async function main() {
  let targetVersion = args._[0];

  if (!targetVersion) {
    // no explicit version, offer suggestions
    const {release} = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom']),
    });

    if (release === 'custom') {
      targetVersion = (
        await prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion,
        })
      ).version;
    } else {
      targetVersion = release.match(/\((.*)\)/)[1];
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  const {yes} = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  });

  if (!yes) {
    return;
  }

  // run tests before release
  if (!skipTests) {
    await run(bin('jest'), ['--clearCache']);
    await run('yarn', ['test']);
  }

  // update all package versions and inter-dependencies
  updateVersions(targetVersion);

  // all good...
  if (isDryRun) {
    // stop here so we can inspect changes to be committed
    // and packages built
    console.log('Dry run finished.');
  } else {
    // update changelog
    console.log('update changelog...');
    await run('yarn', ['run', 'changelog', targetVersion]);

    // commit all changes
    console.log('Committing changes...');
    await run('git', ['add', '-A']);
    await run('git', ['commit', '-m', `release: v${targetVersion}`]);

    // publish packages
    // console.log('Publish package...');
    // const releaseTag = Array.isArray(semver.prerelease(targetVersion)) ? semver.prerelease(targetVersion)[0] : 'latest';
    // await publish(releaseTag);

    // push to GitHub
    console.log('Push to GitHub...');
    await run('git', ['tag', `v${targetVersion}`]);
    await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
    await run('git', ['push']);
  }
}

function updateVersions(version) {
  console.log('Updating versions...');
  // 1. update root package.json
  updatePackage(path.resolve(__dirname, '..'), version);
}

function updatePackage(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = readPkg(pkgRoot);
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
}

function readPkg(pkgRoot) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
}

async function publish(releaseTag) {
  const pkgRoot = path.resolve(__dirname, '..');
  const pkg = readPkg(pkgRoot);
  if (!pkg.private) {
    await run('yarn', ['publish', '--non-interactive', '--tag', releaseTag], {
      cwd: pkgRoot,
    });
  }
}

main().catch(err => {
  console.error(err);
});
