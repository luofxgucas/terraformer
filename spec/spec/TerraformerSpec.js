if(typeof module === "object"){
  var Terraformer = require("../../src/terraformer.js");
}

describe("Primitives", function(){

  it("should create a Point from GeoJSON", function(){
    var point = new Terraformer.Primitive(GeoJSON.points[1]);

    expect(point).toBeInstanceOfClass(Terraformer.Point);
    expect(point.coordinates).toEqual(GeoJSON.points[1].coordinates);
  });

  it("should create a MultiPoint from GeoJSON", function(){
    var multiPoint = new Terraformer.Primitive(GeoJSON.multiPoints[1]);

    expect(multiPoint).toBeInstanceOfClass(Terraformer.MultiPoint);
    expect(multiPoint.coordinates).toEqual(GeoJSON.multiPoints[1].coordinates);
  });

  it("should create a LineString from GeoJSON", function(){
    var lineString = new Terraformer.Primitive(GeoJSON.lineStrings[3]);

    expect(lineString).toBeInstanceOfClass(Terraformer.LineString);
    expect(lineString.coordinates).toEqual(GeoJSON.lineStrings[3].coordinates);
  });

  it("should create a MultiLineString from GeoJSON", function(){
    var multiLineString = new Terraformer.Primitive(GeoJSON.multiLineStrings[1]);

    expect(multiLineString).toBeInstanceOfClass(Terraformer.MultiLineString);
    expect(multiLineString.coordinates).toEqual(GeoJSON.multiLineStrings[1].coordinates);
  });

  it("should create a Polygon from GeoJSON", function(){
    var polygon = new Terraformer.Primitive(GeoJSON.polygons[2]);
    expect(polygon).toBeInstanceOfClass(Terraformer.Polygon);
    expect(polygon.coordinates).toEqual(GeoJSON.polygons[2].coordinates);
  });

  it("should create a MultiPolygon from GeoJSON", function(){
    multiPolygon = new Terraformer.Primitive(GeoJSON.multiPolygons[1]);
    expect(multiPolygon).toBeInstanceOfClass(Terraformer.MultiPolygon);
    expect(multiPolygon.coordinates).toEqual(GeoJSON.multiPolygons[1].coordinates);
  });

  it("should create a Feature from GeoJSON", function(){
    var feature = new Terraformer.Primitive(GeoJSON.features[0]);

    expect(feature).toBeInstanceOfClass(Terraformer.Feature);
    expect(feature.geometry.coordinates).toEqual(GeoJSON.features[0].geometry.coordinates);
    expect(feature.geometry.type).toEqual("Polygon");
  });

  it("should create a FeatureCollection from GeoJSON", function(){
    var featureCollection = new Terraformer.Primitive(GeoJSON.featureCollections[0]);

    expect(featureCollection).toBeInstanceOfClass(Terraformer.FeatureCollection);
    expect(featureCollection.features[0].geometry.coordinates).toEqual(featureCollection.features[0].geometry.coordinates);
    expect(featureCollection.features[0].geometry.type).toEqual("Polygon");
  });

  it("should create a GeometryCollection from GeoJSON", function(){
    var geometryCollection = new Terraformer.Primitive(GeoJSON.geometryCollections[0]);

    expect(geometryCollection).toBeInstanceOfClass(Terraformer.GeometryCollection);
    expect(geometryCollection.geometries.length).toEqual(2);
  });

  describe("Helper Methods", function(){
    it("should convert a Primitive to Web Mercator", function(){
      var point = new Terraformer.Primitive(GeoJSON.points[2]);

      var mercator = point.toMercator();

      expect(mercator.coordinates).toEqual([11131949.079327168, 0]);
      expect(mercator.crs).toEqual(Terraformer.MercatorCRS);
    });

    it("should convert a Primitive to Geographic coordinates", function(){
      var point = new Terraformer.Primitive({
        "type": "Point",
        "coordinates": [11354588.06,222684.20]
      });

      var mercator = point.toGeographic();

      expect(mercator.coordinates).toEqual([101.99999999179026, 1.9999999236399357]);
    });

    it("should convert a Primitive to JSON", function(){
      var geometryCollection = new Terraformer.Primitive(GeoJSON.geometryCollections[0]);

      var json = geometryCollection.toJSON();
      expect(json.bbox).toBeTruthy();
      expect(json.type).toBeTruthy();
      expect(json.geometries).toBeTruthy();
      expect(json.length).toBeFalsy();
    });

    it("should convert a Primitive to stringified JSON", function(){
      var point = new Terraformer.Primitive(GeoJSON.points[0]);

      var json = point.toJson();

      expect(json).toEqual(JSON.stringify(point));
    });
  });

  describe("Point", function(){
    beforeEach(function(){
      point = new Terraformer.Point(45, 60);
    });

    it("should create a Point from a 'x' and 'y'", function(){
      expect(point.coordinates).toEqual([45,60]);
    });

    it("should create a Point from a GeoJSON Position", function(){
      var point = new Terraformer.Point([45, 60]);
      expect(point.coordinates).toEqual([45,60]);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.Point(GeoJSON.multiPoints[1]);
      }).toThrow("Terraformer: invalid input for Terraformer.Point");
    });

    it("should calculate bounds", function(){
      expect(point.bbox).toEqual([45, 60, 45, 60]);
    });
  });

  describe("MultiPoint", function(){
    beforeEach(function(){
      multiPoint = new Terraformer.MultiPoint([ [100,0], [-45, 122] ]);
    });

    it("should create a MultiPoint from an array of GeoJSON Positions", function(){
      expect(multiPoint.coordinates).toEqual([ [100,0], [-45, 122] ]);
      expect(multiPoint.type).toEqual("MultiPoint");
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.MultiPoint(GeoJSON.points[1]);
      }).toThrow("Terraformer: invalid input for Terraformer.MultiPoint");
    });

    it("should have a getter for length", function(){
      expect(multiPoint.length).toEqual(2);
    });

    it("should be able to add a point", function(){
      multiPoint.addPoint([80,-60]);
      expect(multiPoint.coordinates).toEqual([ [100,0],[-45, 122],[80,-60] ]);
    });

    it("should be able to insert a point", function(){
      multiPoint.insertPoint([80,-60], 1);
      expect(multiPoint.coordinates).toEqual([ [100,0],[80,-60],[-45, 122] ]);
    });

    it("should be able to remove a point by index", function(){
      multiPoint.removePoint(1);
      expect(multiPoint.coordinates).toEqual([ [100, 0] ]);
    });

    it("should be able to remove a point by position", function(){
      multiPoint.removePoint([-45, 122]);
      expect(multiPoint.coordinates).toEqual([ [100,0] ]);
    });

    it("should be able to itterate over all points", function(){
      var spy = jasmine.createSpy();
      multiPoint.forEach(spy);
      expect(spy.callCount).toEqual(multiPoint.length);
      expect(spy).toHaveBeenCalledWith([100,0], 0, multiPoint.coordinates);
      expect(spy).toHaveBeenCalledWith([-45,122], 1, multiPoint.coordinates);
    });

    it("should calculate bounds", function(){
      expect(multiPoint.bbox).toEqual([-45, 0, 100, 122]);
    });
  });

  describe("LineString", function(){
    beforeEach(function(){
      lineString = new Terraformer.LineString([ [100,0], [-45, 122] ]);
    });

    it("should create a Line from an array of GeoJSON Positions", function(){
      expect(lineString.type).toEqual("LineString");
      expect(lineString.coordinates).toEqual([ [100,0], [-45, 122] ]);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.LineString(GeoJSON.features[1]).toThrow();
      }).toThrow("Terraformer: invalid input for Terraformer.LineString");
    });

    it("should be able to add a vertex", function(){
      lineString.addVertex([80,-60]);
      expect(lineString.coordinates).toEqual([ [100,0],[-45, 122],[80,-60] ]);
    });

    it("should be able to insert a vertex", function(){
      lineString.insertVertex([80,-60], 1);
      expect(lineString.coordinates).toEqual([ [100,0],[80,-60],[-45, 122] ]);
    });

    it("should be able to remove a vertex by index", function(){
      lineString.removeVertex(1);
      expect(lineString.coordinates).toEqual([ [100, 0] ]);
    });

    it("should calculate bounds", function(){
      expect(lineString.bbox).toEqual([-45, 0, 100, 122]);
    });
  });

  describe("MultiLineString", function(){
    beforeEach(function(){
      multiLineString = new Terraformer.MultiLineString([
        [ [-105, 40], [-110, 45], [-115, 55] ],
        [ [-100, 40], [-105, 45], [-110, 55] ]
      ]);
    });

    it("should create a MultiLineString from an array of GeoJSON LineStrings", function(){
      expect(multiLineString.type).toEqual("MultiLineString");
      expect(multiLineString.coordinates).toEqual([
        [ [-105, 40], [-110, 45], [-115, 55] ],
        [ [-100, 40], [-105, 45], [-110, 55] ]
      ]);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.MultiLineString(GeoJSON.features[1]).toThrow();
      }).toThrow("Terraformer: invalid input for Terraformer.MultiLineString");
    });

    it("should have a getter for length", function(){
      expect(multiLineString.length).toEqual(2);
    });

    it("should calculate bounds", function(){
      expect(multiLineString.bbox).toEqual([-115, 40, -100, 55]);
    });
  });

  describe("Polygon", function(){
    beforeEach(function(){
      polygon = new Terraformer.Polygon([ [ [100.0, 0.0],[101.0, 0.0],[101.0, 1.0],[100.0, 1.0],[100.0, 0.0] ] ]);
    });

    it("should create a Polygon from an array of GeoJSON Positions", function(){
      expect(polygon.type).toEqual("Polygon");
      expect(polygon.coordinates).toEqual([ [ [100.0, 0.0],[101.0, 0.0],[101.0, 1.0],[100.0, 1.0],[100.0, 0.0] ] ]);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.Polygon(GeoJSON.features[1]);
      }).toThrow("Terraformer: invalid input for Terraformer.Polygon");
    });

    it("should be able to add a vertex", function(){
      polygon.addVertex([45, 100]);
      expect(polygon.coordinates).toEqual([ [ [100.0, 0.0],[101.0, 0.0],[101.0, 1.0],[100.0, 1.0],[100.0, 0.0],[45, 100] ] ]);
    });

    it("should be able to insert a vertex", function(){
      polygon.insertVertex([45, 100], 1);
      expect(polygon.coordinates).toEqual([ [ [100.0, 0.0],[45, 100],[101.0, 0.0],[101.0, 1.0],[100.0, 1.0],[100.0, 0.0] ] ]);
    });

    it("should be able to remove a vertex by index", function(){
      polygon.removeVertex(0);
      expect(polygon.coordinates).toEqual([ [ [101.0, 0.0],[101.0, 1.0],[100.0, 1.0],[100.0, 0.0] ] ]);
    });

    it("should calculate bounds", function(){
      expect(polygon.bbox).toEqual([100, 0, 101, 1]);
    });
  });

  describe("MultiPolygon", function(){
    beforeEach(function(){
      multiPolygon = new Terraformer.MultiPolygon(GeoJSON.multiPolygons[0].coordinates);
    });

    it("should create a MultiPolygon from an array of GeoJSON Polygons", function(){
      expect(multiPolygon.type).toEqual("MultiPolygon");
      expect(multiPolygon.coordinates).toEqual(GeoJSON.multiPolygons[0].coordinates);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.MultiPolygon(GeoJSON.multiPoints[0]);
      }).toThrow("Terraformer: invalid input for Terraformer.MultiPolygon");
    });

    it("should have a getter for length", function(){
      expect(multiPolygon.length).toEqual(2);
    });

    it("should calculate bounds", function(){
      expect(multiPolygon.bbox).toEqual([100, 0, 103, 3]);
    });
  });

  describe("Circle", function(){
    beforeEach(function(){
      circle = new Terraformer.Circle([-122, 45], 1000, 128);
    });

    it("should create a Circle Feature from a GeoJSON Position and a radius", function(){
      expect(circle.type).toEqual("Feature");
      expect(circle.geometry.type).toEqual("Polygon");
      expect(circle.geometry.coordinates[0].length).toEqual(128);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.Circle();
      }).toThrow("Terraformer: missing parameter for Terraformer.Circle");
    });

    it("should have a getter for steps", function(){
      expect(circle.steps).toEqual(128);
    });

    it("should have a setter for steps", function(){
      circle.steps = 64;
      expect(circle.steps).toEqual(64);
    });

    it("should have a getter for radius", function(){
      expect(circle.radius).toEqual(1000);
    });

    it("should have a setter for radius", function(){
      circle.radius = 500;
      expect(circle.radius).toEqual(500);
    });

    it("should have a getter for center", function(){
      expect(circle.center).toEqual([-122,45]);
    });

    it("should have a setter for center", function(){
      circle.center = [80,50];
      expect(circle.center).toEqual([80,50]);
    });

    it("should calculate bounds", function(){
      expect(circle.bbox).toEqual([ -122.00898315283914, 44.99364759960156, -121.99101684715673, 45.00635169618245 ]);
    });
  });

  describe("Feature", function(){
    beforeEach(function(){
      feature = new Terraformer.Feature(GeoJSON.polygons[0]);
    });

    it("should create a Feature from a GeoJSON Geometry", function(){
      expect(feature.type).toEqual("Feature");
      expect(feature.geometry.type).toEqual("Polygon");
      expect(feature.geometry.coordinates).toEqual(GeoJSON.polygons[0].coordinates);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.Feature({
          type: "Polygon"
        }).toThrow("Terraformer: invalid input for Terraformer.Feature");
      });
    });

    it("should calculate bounds", function(){
      expect(feature.bbox).toEqual([21.79, 33.75, 56.95, 71.01]);
    });
  });

  describe("FeatureCollection", function(){
    beforeEach(function(){
      featureCollection = new Terraformer.FeatureCollection([
        GeoJSON.features[0], GeoJSON.features[1]
      ]);
    });

    it("should create a FeatureCollection from an array of GeoJSON Features", function(){
      expect(featureCollection.features.length).toEqual(2);
      expect(featureCollection.features[0]).toEqual(GeoJSON.features[0]);
      expect(featureCollection.features[1]).toEqual(GeoJSON.features[1]);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.FeatureCollection({
          "type": "Polygon"
        }).toThrow("Terraformer: invalid input for Terraformer.FeatureCollection");
      });
    });

    it("should calculate bounds", function(){
      expect(featureCollection.bbox).toEqual([ -104.99404, 33.75, 56.95, 71.01 ] );
    });
  });

  describe("GeometryCollection", function(){
    beforeEach(function() {
      geometryCollection = new Terraformer.GeometryCollection([GeoJSON.polygons[0], GeoJSON.polygons[1]]);
    });

    it("should create a GeometryCollection from an array of GeoJSON Geometries", function(){
      expect(geometryCollection.geometries.length).toEqual(2);
      expect(geometryCollection.geometries[0]).toEqual(GeoJSON.polygons[0]);
      expect(geometryCollection.geometries[1]).toEqual(GeoJSON.polygons[1]);
    });

    it("should throw an error when called invalid data", function(){
      expect(function(){
        new Terraformer.GeometryCollection({
          "type": "Polygon"
        }).toThrow("Terraformer: invalid input for Terraformer.GeometryCollection");
      });
    });

    it("should calculate bounds", function(){
      expect(geometryCollection.bbox).toEqual([ -84.32281494140625, 33.73804486328907, 56.95, 71.01 ]);
    });
  });
});