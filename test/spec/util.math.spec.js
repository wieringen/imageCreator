define(["cs!src/core/util.math"], function(utilMath)
{
    describe("util.math", function()
    {
        it("The toRadians method converts degrees into radians.", function()
        {
            expect(

                utilMath.toRadians(30)

            ).toEqual(0.5235987755982988);
        });

        it("The toDegrees method converts radians into degrees.", function()
        {
            expect(

                Math.round( utilMath.toDegrees(0.5235987755982988) )

            ).toEqual(30);
        });

        it("The getBoundingBox method returns the boundingbox of a rectangle.", function()
        {
            var size =
                {
                    width  : 100
                ,   height : 150
                }
            ,   rotation =
                {
                    sin : 0.573576436351046
                ,   cos : 0.819152044288992
                }
            ;

            expect(

                utilMath.getBoundingBox( size, rotation )

            ).toEqual({
                height : 180.23045027845342
            ,   width  : 167.9516698815561
            });
        });

    });
});