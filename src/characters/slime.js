import Vector2 from 'phaser/src/math/Vector2'
const eps = 20;
export default class Slime extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
    }
    update() {
        if (this.hasArrived())
        {
            this.pointOfInterest = new Vector2( Phaser.Math.RND.between(0, this.scene.physics.world.bounds.width - 1),
                Phaser.Math.RND.between(50, this.scene.physics.world.bounds.height - 50));
            const neededTileX = Math.floor(this.pointOfInterest.x / 32) ;
            const neededTileY = Math.floor(this.pointOfInterest.y / 32) ;
            const currentPositionX =  Math.floor(this.body.x / 32);
            const currentPositionY =  Math.floor(this.body.y / 32);
            const me = this;
            if (!this.wantToJump)
            {
                this.scene.finder.findPath(currentPositionX, currentPositionY, neededTileX, neededTileY, function( path ) {
                    if (path === null) {
                        console.warn("Slime says: Path was not found, gonna jump!");
                        me.path = [];
                        me.wantToJump = true;
                    } else {
                        me.path = path;
                        console.log("Slime says: Path was found, need to go...");
                        me.selectNextLocation();
                    }
                });
                this.scene.finder.calculate();
            }

        }
        if (this.nextLocation)
        {
            const body = this.body;
            const position = body.position;

            if (position.distance(this.nextLocation) < eps) {
                this.selectNextLocation();
            }
            else {

                let delta = Math.round(this.nextLocation.x - position.x);
                if (delta !== 0) {
                    body.setVelocity(delta, 0);
                } else {
                    delta = Math.round(this.nextLocation.y - position.y);

                    body.setVelocity(0, delta);
                }
                this.body.velocity.normalize().scale(Math.min(Math.abs(delta), this.speed));
            }
        }

        this.updateAnimation();
    }
    updateAnimation() {
        const animsController = this.anims;
        if (this.wantToJump)
        {
            animsController.play(this.animations[1], true);
        } else
        {
            animsController.play(this.animations[0], true);
        }

    }
    hasArrived()
    {
        return this.pointOfInterest === undefined || this.pointOfInterest.distance(this.body.position) < eps;
    }
    selectNextLocation() {
        const nextTile = this.path.shift();
        if (nextTile)
        {
            this.nextLocation = new Vector2(nextTile.x * 32, nextTile.y * 32);
        } else
        {
            this.nextLocation = this.body.position;
        }
    }
}
