
sub main(args)

    #if unittest
        'bs:disable-next-line
        Rooibos_init("RooibosScene")
        return
    #end if

    ' Create MainScene
    screen = CreateObject("roSGScreen")
    m.port = CreateObject("roMessagePort")
    screen.SetMessagePort(m.port)
    screen.CreateScene("MainScene")
    screen.Show()

    ' Main Loop
    while true
        msg = Wait(0, m.port)
        msgType = Type(msg)
        if msgType = "roSGScreenEvent"
            if msg.IsScreenClosed()
                return
            end if
        end if
    end while
end sub
