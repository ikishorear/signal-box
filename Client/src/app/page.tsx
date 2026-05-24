import {Button} from "@/components/ui/button";

export default function Root(){

  return(
    <>
      <h1 className="text-large">
        Hello, World!
      </h1>
      <Button className="bg-blue-500 text-white hover:bg-blue-600">
        Click Me
      </Button>
    </>
  );

}