/* The list and one journey's detail are the same route tree: `children` is
   whichever of the two the URL names, and `modal` is the intercepted copy of
   the detail that renders over the list on a client-side navigation. A hard
   load of a journey URL renders the full page instead, and closing the modal
   is a history step rather than component state. */
export default function JourneysLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
